import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const APP_PATH=process.env.COLOR_LAB_APP_PATH||'.native-derived/Build/Products/Debug-iphonesimulator/App.app';
const BUNDLE_ID='com.sy1124.colorlab';
const SCREENSHOT='.native-derived/color-lab-native-launch.png';
const LAUNCH_LOG='.native-launch.txt';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function runXcrun(label,args,timeoutMs,{allowFailure=false,allowTimeout=false}={}){
  console.log(`[native-smoke] START ${label} (timeout ${Math.round(timeoutMs/1000)}s)`);
  const result=spawnSync('xcrun',args,{
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
    console.log(`[native-smoke] ${label} timed out after ${timeoutMs}ms`);
    return{...result,timedOut:true};
  }
  if(result.error)throw new Error(`${label} failed: ${result.error.message}`);
  if(result.status!==0&&!allowFailure)throw new Error(`${label} exited with status ${result.status}`);
  if(result.status===0)console.log(`[native-smoke] PASS ${label}`);
  else console.log(`[native-smoke] ${label} returned status ${result.status}`);
  return{...result,timedOut:false};
}
const simctl=(label,args,timeoutMs,options)=>runXcrun(label,['simctl',...args],timeoutMs,options);

function availableDevices(){
  const list=simctl('list available devices',['list','devices','available','-j'],30000);
  const groups=JSON.parse(list.stdout||'{}').devices||{};
  return Object.values(groups).flat().filter(device=>device&&device.isAvailable!==false);
}

if(!fs.existsSync(APP_PATH))throw new Error('Simulator app bundle missing: '+APP_PATH);

const devices=availableDevices().filter(device=>String(device.name||'').startsWith('iPhone'));
if(!devices.length)throw new Error('No available iPhone Simulator found');
const device=devices.find(item=>item.state==='Booted')||devices.find(item=>item.state==='Shutdown')||devices[0];
const udid=device.udid;
console.log(`[native-smoke] selected ${device.name} ${udid} state=${device.state}`);

try{
  if(device.state!=='Booted'){
    simctl('request simulator boot',['boot',udid],20000,{allowFailure:true,allowTimeout:true});
    console.log('[native-smoke] warming cold simulator for 45s before install');
    await sleep(45000);
  }

  simctl('install Color Lab',['install',udid,APP_PATH],120000);

  const launch=simctl('launch Color Lab',['launch',udid,BUNDLE_ID],180000);
  fs.writeFileSync(LAUNCH_LOG,(launch.stdout||'')+(launch.stderr||''));
  if(!(launch.stdout||'').includes(BUNDLE_ID+':')){
    throw new Error('Launch output did not contain '+BUNDLE_ID+': <pid>');
  }

  await sleep(3000);
  simctl('capture launch screenshot',['io',udid,'screenshot',SCREENSHOT],30000);
  const size=fs.statSync(SCREENSHOT).size;
  if(size<=0)throw new Error('Simulator launch screenshot is empty');
  console.log(`[native-smoke] PASS screenshot ${SCREENSHOT} (${size} bytes)`);
  console.log('[native-smoke] PASS install + launch smoke');
}catch(error){
  console.error('[native-smoke] FAIL',error);
  process.exitCode=1;
}finally{
  try{simctl('terminate Color Lab',['terminate',udid,BUNDLE_ID],15000,{allowFailure:true,allowTimeout:true})}catch(_){}
  try{simctl('shutdown simulator',['shutdown',udid],15000,{allowFailure:true,allowTimeout:true})}catch(_){}
}
