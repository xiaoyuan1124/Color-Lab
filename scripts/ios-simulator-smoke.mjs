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

function simulatorProfiles(){
  const list=simctl('list available devices',['list','devices','available','-j'],30000);
  const groups=JSON.parse(list.stdout||'{}').devices||{};
  const profiles=[];
  for(const [runtimeIdentifier,devices] of Object.entries(groups)){
    if(!runtimeIdentifier.includes('SimRuntime.iOS-'))continue;
    for(const device of devices||[]){
      if(!device||device.isAvailable===false||!String(device.name||'').startsWith('iPhone'))continue;
      profiles.push({
        runtimeIdentifier,
        deviceTypeIdentifier:device.deviceTypeIdentifier,
        name:device.name
      });
    }
  }
  const runtimeRank=id=>{
    const match=id.match(/iOS-(\d+)-(\d+)/);
    return match?Number(match[1])*100+Number(match[2]):99999;
  };
  profiles.sort((a,b)=>runtimeRank(a.runtimeIdentifier)-runtimeRank(b.runtimeIdentifier)||a.name.localeCompare(b.name));
  const seen=new Set();
  return profiles.filter(profile=>{
    const key=profile.runtimeIdentifier+'|'+profile.deviceTypeIdentifier;
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
}

function createFreshSimulator(profile,session){
  const name=`Color Lab CI ${session}`;
  const result=simctl(
    'create fresh simulator',
    ['create',name,profile.deviceTypeIdentifier,profile.runtimeIdentifier],
    30000
  );
  const udid=(result.stdout||'').trim().split(/\s+/).pop();
  if(!/^[0-9A-F-]{36}$/i.test(udid||''))throw new Error('Fresh simulator creation did not return a UDID');
  console.log(`[native-smoke] created ${name} ${udid} runtime=${profile.runtimeIdentifier} type=${profile.deviceTypeIdentifier}`);
  return udid;
}

async function resetCoreSimulator(){
  console.log('[native-smoke] RECOVER CoreSimulator service');
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
  console.log('[native-smoke] START launch request (async; PID proven by simctl output or launchctl)');
  const child=spawn('xcrun',['simctl','launch',udid,BUNDLE_ID],{stdio:['ignore','pipe','pipe']});
  let stdout='';
  let stderr='';
  child.stdout.on('data',chunk=>{stdout+=chunk.toString();});
  child.stderr.on('data',chunk=>{stderr+=chunk.toString();});
  child.on('error',error=>{stderr+=String(error);});
  return{child,getOutput:()=>({stdout,stderr})};
}

function launchPidFromSimctlOutput(output){
  const text=String(output?.stdout||'')+'\n'+String(output?.stderr||'');
  const escaped=BUNDLE_ID.replaceAll('.','\\.');
  const match=text.match(new RegExp(escaped+'\\s*:\\s*(\\d+)'));
  const pid=match?Number.parseInt(match[1],10):NaN;
  return Number.isInteger(pid)&&pid>0?pid:null;
}

async function waitForLaunchProof(udid,launchRequest,attempts=8){
  for(let attempt=1;attempt<=attempts;attempt++){
    const directPid=launchPidFromSimctlOutput(launchRequest.getOutput());
    if(directPid){
      console.log(`[native-smoke] PASS simctl launch process ${BUNDLE_ID} pid=${directPid}`);
      return{pid:directPid,line:`simctl launch: ${BUNDLE_ID}: ${directPid}`,source:'simctl-launch'};
    }

    console.log(`[native-smoke] UIKit PID probe ${attempt}/${attempts}`);
    const result=simctl(
      'inspect UIKit launchd jobs',
      ['spawn',udid,'launchctl','list'],
      15000,
      {allowFailure:true,allowTimeout:true}
    );

    const postProbePid=launchPidFromSimctlOutput(launchRequest.getOutput());
    if(postProbePid){
      console.log(`[native-smoke] PASS simctl launch process ${BUNDLE_ID} pid=${postProbePid}`);
      return{pid:postProbePid,line:`simctl launch: ${BUNDLE_ID}: ${postProbePid}`,source:'simctl-launch'};
    }

    if(!result.timedOut&&result.status===0){
      const line=(result.stdout||'').split(/\r?\n/).find(row=>row.includes('UIKitApplication:'+BUNDLE_ID));
      if(line){
        const pid=Number.parseInt(line.trim().split(/\s+/)[0],10);
        if(Number.isInteger(pid)&&pid>0){
          console.log(`[native-smoke] PASS UIKit process ${BUNDLE_ID} pid=${pid}`);
          return{pid,line,source:'launchctl'};
        }
      }
    }
    if(attempt<attempts)await sleep(10000);
  }

  const launchOutput=launchRequest.getOutput();
  fs.appendFileSync(LAUNCH_LOG,'launch proof failure output:\n'+launchOutput.stdout+launchOutput.stderr+'\n');
  throw new Error(`No launch PID proof found for ${BUNDLE_ID}`);
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

async function runFreshSession(profile,session){
  let udid=null;
  let launchRequest=null;
  try{
    udid=createFreshSimulator(profile,session);
    simctl('boot fresh simulator',['boot',udid],30000);
    // A successful `simctl boot` only requests boot. Block until SpringBoard and
    // simulator services report readiness before attempting to install the app.
    // Timeout remains bounded; a failure is recovered by the existing second session.
    simctl('wait for fresh simulator boot readiness',['bootstatus',udid,'-b'],120000);
    runCommand(
      'open Simulator host',
      'open',
      ['-a','Simulator','--args','-CurrentDeviceUDID',udid],
      15000,
      {allowFailure:true,allowTimeout:true}
    );
    console.log('[native-smoke] warming fresh simulator for 60s before install');
    await sleep(60000);

    simctl('install Color Lab',['install',udid,APP_PATH],120000);

    launchRequest=startLaunchRequest(udid);
    const running=await waitForLaunchProof(udid,launchRequest,8);
    const launchOutput=launchRequest.getOutput();
    fs.appendFileSync(
      LAUNCH_LOG,
      `SESSION ${session} launch PID: ${running.pid} source=${running.source}\n${running.line}\n${launchOutput.stdout}${launchOutput.stderr}\n`
    );

    await sleep(3000);
    const size=await captureScreenshotWithRetry(udid,3);
    console.log(`[native-smoke] PASS screenshot ${SCREENSHOT} (${size} bytes)`);
    console.log(`[native-smoke] PASS fresh simulator install + launch session ${session}`);
    return true;
  }finally{
    if(launchRequest?.child&&!launchRequest.child.killed){
      try{launchRequest.child.kill('SIGTERM')}catch(_){}
    }
    if(udid){
      try{simctl('terminate Color Lab',['terminate',udid,BUNDLE_ID],15000,{allowFailure:true,allowTimeout:true})}catch(_){}
      try{simctl('shutdown fresh simulator',['shutdown',udid],15000,{allowFailure:true,allowTimeout:true})}catch(_){}
      try{simctl('delete fresh simulator',['delete',udid],30000,{allowFailure:true,allowTimeout:true})}catch(_){}
    }
  }
}

if(!fs.existsSync(APP_PATH))throw new Error('Simulator app bundle missing: '+APP_PATH);
try{fs.rmSync(SCREENSHOT,{force:true})}catch(_){}
try{fs.rmSync(LAUNCH_LOG,{force:true})}catch(_){}

const profiles=simulatorProfiles();
if(!profiles.length)throw new Error('No compatible iPhone Simulator profile found');

let finalError=null;
for(let session=1;session<=2;session++){
  try{
    if(session>1)await resetCoreSimulator();
    const profile=profiles[Math.min(session-1,profiles.length-1)];
    console.log(`[native-smoke] SESSION ${session}/2 profile=${profile.name} runtime=${profile.runtimeIdentifier}`);
    await runFreshSession(profile,session);
    finalError=null;
    break;
  }catch(error){
    finalError=error;
    console.error(`[native-smoke] SESSION ${session} FAIL`,error);
    fs.appendFileSync(LAUNCH_LOG,`SESSION ${session} FAIL: ${error?.stack||error}\n`);
  }
}

if(finalError){
  console.error('[native-smoke] FAIL all fresh simulator sessions',finalError);
  process.exitCode=1;
}else{
  console.log('[native-smoke] PASS fresh simulator session gate');
}
