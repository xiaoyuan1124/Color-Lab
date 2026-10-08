import assert from 'node:assert/strict';

const SHA=/^[0-9a-f]{40}$/;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function verifyIdentity(value,{sha,ref,repository}){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid deploy-info.json payload');
  if(value.sha!==sha)throw new Error('Pages SHA mismatch: '+String(value.sha)+' != '+sha);
  if(value.ref!==ref)throw new Error('Pages ref mismatch: '+String(value.ref)+' != '+ref);
  if(value.repository!==repository)throw new Error('Pages repository mismatch: '+String(value.repository)+' != '+repository);
}

async function verifyPublicDeployment({baseUrl,identity,fetcher=fetch,attempts=20,waitMs=6000}){
  const base=new URL(baseUrl);
  if(base.protocol!=='https:')throw new Error('Pages deployment URL must be HTTPS');
  if(!base.pathname.endsWith('/'))base.pathname+='/';
  const endpoint=new URL('deploy-info.json',base);
  let lastError;
  for(let attempt=1;attempt<=attempts;attempt++){
    const url=new URL(endpoint.href);
    url.searchParams.set('release_sha',identity.sha);
    url.searchParams.set('proof_attempt',String(attempt));
    try{
      const response=await fetcher(url.href,{
        headers:{'Cache-Control':'no-cache','Pragma':'no-cache'},
        cache:'no-store',
        signal:AbortSignal.timeout(15000)
      });
      if(!response.ok)throw new Error('HTTP '+response.status);
      verifyIdentity(await response.json(),identity);
      console.log('PASS: public Pages identity '+identity.sha+' on attempt '+attempt+'/'+attempts);
      return;
    }catch(error){
      lastError=error;
      console.error('Pages identity attempt '+attempt+'/'+attempts+': '+error.message);
      if(attempt<attempts)await sleep(waitMs);
    }
  }
  throw new Error('Public Pages deployment not at expected SHA: '+lastError?.message);
}

async function selfTest(){
  const identity={sha:'a'.repeat(40),ref:'refs/heads/main',repository:'xiaoyuan1124/Color-Lab'};
  verifyIdentity({...identity},identity);
  assert.throws(()=>verifyIdentity({...identity,sha:'b'.repeat(40)},identity),/SHA mismatch/);
  assert.throws(()=>verifyIdentity({...identity,ref:'refs/heads/other'},identity),/ref mismatch/);
  assert.throws(()=>verifyIdentity({...identity,repository:'other/repo'},identity),/repository mismatch/);
  assert.throws(()=>verifyIdentity([],identity),/Invalid/);
  let attempts=0;
  const visited=[];
  await verifyPublicDeployment({
    baseUrl:'https://example.github.io/Color-Lab/',
    identity,attempts:2,waitMs:0,
    fetcher:async(url)=>{
      visited.push(url);
      attempts++;
      return{ok:true,json:async()=>({...identity,sha:attempts===1?'b'.repeat(40):identity.sha})};
    }
  });
  assert.equal(attempts,2,'stale Pages response must be retried');
  assert.equal(new URL(visited[0]).pathname,'/Color-Lab/deploy-info.json');
  await assert.rejects(
    verifyPublicDeployment({
      baseUrl:'https://example.github.io/Color-Lab/',identity,attempts:1,waitMs:0,
      fetcher:async()=>({ok:false,status:404})
    }),/Public Pages deployment not at expected SHA/
  );
  console.log('PASS: Pages live SHA proof self-test');
}

const mode=process.argv[2];
if(mode==='--self-test'){
  await selfTest();
}else if(mode==='--verify-live'){
  const identity={
    sha:process.env.GITHUB_SHA,
    ref:process.env.GITHUB_REF,
    repository:process.env.GITHUB_REPOSITORY
  };
  if(!SHA.test(identity.sha||'')||identity.ref!=='refs/heads/main'||identity.repository!=='xiaoyuan1124/Color-Lab'){
    throw new Error('Missing or unexpected main deployment GitHub identity');
  }
  if(!process.env.PAGES_DEPLOY_URL)throw new Error('Missing Pages deployment URL from actions/deploy-pages');
  await verifyPublicDeployment({baseUrl:process.env.PAGES_DEPLOY_URL,identity});
}else{
  throw new Error('Usage: node scripts/pages-live-proof.mjs --self-test|--verify-live');
}
