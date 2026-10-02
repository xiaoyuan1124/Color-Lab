import fs from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';

const APP_PATH=process.env.COLOR_LAB_APP_PATH||'.native-derived/Build/Products/Debug-iphonesimulator/App.app';
const BUNDLE_ID='com.sy1124.colorlab';
const SCREENSHOT='.native-derived/color-lab-native-launch.png';
const LAUNCH_LOG='.native-launch.txt';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function runCommand(label,command,args,timeoutMs,{allowFailure=false,allowTimeout=false}={}){
  console.log(`[native-smoke] START ${label} (timeout ${Math.round(timeoutMs/1000)}s)`);
  const result=spawnSync(command,args,{
    encoding:'utf8',
    timeout:timeoutMs,
    killSignal:'SIGKILL',
    stdio:['ignore','pipe','pipe']
  });
  const stdout=result.stdout?.trim()||'';
  const stderr=result.stderr?.trim()||'';
  if(stdout)console.log(`[native-smoke] ${label} stdout:\n${stdout}`);
  if(stderr)console.error(`[native-smoke] ${label} stderr:\n${stderr}`);
  const timedOut=result.error?.code==='ETIMEDOUT';
  if(timedOut&&allowTimeout){
    console.log(`[native-smoke] ${label} timed out after ${timeoutMs}ms; bounded recovery may continue`);
    return{...result,timedOut:true};
  }
  if(result.error)throw new Error(`${label} failed: ${result.error.message}`);
  if(result.status!==0&&!allowFailure)throw new Error(`${label} exited with status ${result.status}`);
  if(result.status===0)console.log(`[native-smoke] PASS ${label}`);
  else console.log(`[native-smoke] ${label} returned status ${result.status}; bounded recovery may continue`);
  return{...result,timedOut:false};
}
const simctl=(label,args,timeoutMs,options)=>runCommand(label,'xcrun',['simctl',...args],timeoutMs,options);

function availableDevices(){
  const list=simctl('list available devices',['list','devices','available','-j'],30000);
  const groups=JSON.parse(list.stdout||'{}').devices||{};
  return Object.values(groups).flat().filter(device=>device&&device.isAvailable!==false&&String(device.name||'').startsWith('iPhone'));
}

async function resetCoreSimulator(){
  console.log('[native-smoke] RECOVER CoreSimulator session');
  simctl('shutdown all simulators',['shutdown','all'],15000,{allowFailure:true,allowTimeout:true});
  runCommand(
    'restart CoreSimulatorService',
    'killall',
    ['-9','com.apple.CoreSimulator.CoreSimulatorService'],
    10000,
    {allowFailure:true,allowTimeout:true}
  );
  await sleep(7000);
}

function startLaunchRequest(udid){
  console.log('[native-smoke] START launch request (async; PID proven via launchctl)');
  const child=spawn('xcrun',['simctl','launch',udid,BUNDLE_ID],{
    stdio:['ignore','pipe','pipe']
  });
  let stdout='';
  let stderr='';
  child.stdout.on('data',chunk=>{stdout+=chunk.toString();});
  child.stderr.on('data',chunk=>{stderr+=chunk.toString();});
  child.on('error',error=>{stderr+=String(error);});
  return{child,getOutput:()=>({stdout,stderr})};
}

async function waitForUIKitProcess(udid,attempts=6){
  for(let attempt=1;attempt<=attempts;attempt++){
    console.log(`[native-smoke] UIKit PID probe ${attempt}/${attempts}`);
    const result=simctl(
      'inspect UIKit launchd jobs',
      ['spawn',udid,'launchctl','list'],
      15000,
      {allowFailure:true,allowTimeout:true}
    );
    if(!result.timedOut&&result.status===0){
      const line=(result.stdout||'').split(/\r?\n/).find(row=>row.includes('UIKitApplication:'+BUNDLE_ID));
      if(line){
        const pid=Number.parseInt(line.trim().split(/\s+/)[0],10);
        if(Number.isInteger(pid)&&pid>0){
          console.log(`[native-smoke] PASS UIKit process ${BUNDLE_ID} pid=${pid}`);
          return{pid,line};
        }
      }
    }
    if(attempt<attempts)await sleep(10000);
  }
  throw new Error(`No running UIKitApplication job found for ${BUNDLE_ID}`);
}

async function captureScreenshotWithRetry(udid,attempts=3){
  for(let attempt=1;attempt<=attempts;attempt++){
    console.log(`[native-smoke] screenshot attempt ${attempt}/${attempts}`);
    const result=simctl(
      'capture launch screenshot',
      ['io',udid,'screenshot',SCREENSHOT],
      30000,
      {allowFailure:true,allowTimeout:true}
    );
    if(!result.timedOut&&result.status===0&&fs.existsSync(SCREENSHOT)&&fs.statSync(SCREENSHOT).size>0){
      return fs.statSync(SCREENSHOT).size;
    }
    if(attempt<attempts)await sleep(5000);
  }
  throw new Error('Simulator launch screenshot did not complete successfully');
}

async function runSessionAttempt(device,attemptNumber){
  const udid=device.udid;
  let launchRequest=null;
  console.log(`[native-smoke] SESSION ${attemptNumber}/2 using ${device.name} ${udid} state=${device.state}`);
  try{
    if(device.state!=='Booted'){
      simctl('request simulator boot',['boot',udid],20000,{allowFailure:true,allowTimeout:true});
      runCommand(
        'open Simulator host',
        'open',
        ['-a','Simulator','--args','-CurrentDeviceUDID',udid],
        15000,
        {allowFailure:true,allowTimeout:true}
      );
      console.log('[native-smoke] warming cold simulator for 45s before install');
      await sleep(45000);
    }

    simctl('install Color Lab',['install',udid,APP_PATH],120000);

    launchRequest=startLaunchRequest(udid);
    const running=await waitForUIKitProcess(udid,6);
    const launchOutput=launchRequest.getOutput();
    fs.appendFileSync(
      LAUNCH_LOG,
      `SESSION ${attemptNumber} UIKitApplication PID: ${running.pid}\n${running.line}\n${launchOutput.stdout}${launchOutput.stderr}\n`
    );

    await sleep(3000);
    const size=await captureScreenshotWithRetry(udid,3);
    console.log(`[native-smoke] PASS screenshot ${SCREENSHOT} (${size} bytes)`);
    console.log(`[native-smoke] PASS install + launch smoke on session ${attemptNumber}`);
    return true;
  }finally{
    if(launchRequest?.child&&!launchRequest.child.killed){
      try{launchRequest.child.kill('SIGTERM')}catch(_){}
    }
    try{simctl('terminate Color Lab',['terminate',udid,BUNDLE_ID],15000,{allowFailure:true,allowTimeout:true})}catch(_){}
    try{simctl('shutdown simulator',['shutdown',udid],15000,{allowFailure:true,allowTimeout:true})}catch(_){}
  }
}

if(!fs.existsSync(APP_PATH))throw new Error('Simulator app bundle missing: '+APP_PATH);
try{fs.rmSync(SCREENSHOT,{force:true})}catch(_){}
try{fs.rmSync(LAUNCH_LOG,{force:true})}catch(_){}

const attempted=new Set();
let finalError=null;
for(let session=1;session<=2;session++){
  try{
    if(session>1)await resetCoreSimulator();
    const devices=availableDevices().filter(device=>!attempted.has(device.udid));
    if(!devices.length)throw new Error('No untried available iPhone Simulator found');
    const device=devices.find(item=>item.state==='Booted')||devices.find(item=>item.state==='Shutdown')||devices[0];
    attempted.add(device.udid);
    await runSessionAttempt(device,session);
    finalError=null;
    break;
  }catch(error){
    finalError=error;
    console.error(`[native-smoke] SESSION ${session} FAIL`,error);
    fs.appendFileSync(LAUNCH_LOG,`SESSION ${session} FAIL: ${error?.stack||error}\n`);
  }
}

if(finalError){
  console.error('[native-smoke] FAIL all simulator sessions',finalError);
  process.exitCode=1;
}else{
  console.log('[native-smoke] PASS bounded simulator session recovery');
}
