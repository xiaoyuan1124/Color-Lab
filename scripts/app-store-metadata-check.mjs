import fs from 'node:fs';

const path='app-store/submission.v1.0.json';
const packet=JSON.parse(fs.readFileSync(path,'utf8'));
const failures=[];
const blockers=[];

const chars=value=>[...String(value??'')].length;
const fail=message=>failures.push(message);
const pass=message=>console.log('PASS:',message);

function requireText(key,value,{min=1,max=Infinity}={}){
  const length=chars(value);
  if(typeof value!=='string'||length<min||length>max){
    fail(`${key} length ${length} outside ${min}..${max}`);
    return;
  }
  pass(`${key} length ${length}/${max===Infinity?'∞':max}`);
}
function requireHttps(key,value){
  try{
    const url=new URL(value);
    if(url.protocol!=='https:')throw new Error('not https');
    pass(`${key} HTTPS URL`);
  }catch{
    fail(`${key} must be a valid HTTPS URL`);
  }
}
function hasBlocker(id){
  return Array.isArray(packet.externalBlockers)&&packet.externalBlockers.some(item=>item?.id===id);
}
function externalOrPresent(id,present,message){
  if(present){
    pass(message);
    return;
  }
  if(hasBlocker(id)){
    blockers.push(id);
    console.log('BLOCKED:',message,'— tracked as',id);
    return;
  }
  fail(`${message} missing without external blocker ${id}`);
}

if(packet.schemaVersion!==1)fail('schemaVersion must be 1');
if(packet.product!=='Color Lab')fail('product must be Color Lab');
if(packet.version!=='1.0.0')fail('native App Store version must be 1.0.0');
if(packet.webEngine!=='2.53.0')fail('submission packet must target web engine 2.53.0');
if(packet.bundleId!=='com.sy1124.colorlab')fail('bundleId must remain com.sy1124.colorlab until explicit production registration changes it');
if(packet.locale!=='zh-Hant')fail('primary locale must be zh-Hant');

requireText('name',packet.name,{min:2,max:30});
requireText('subtitle',packet.subtitle,{min:1,max:30});
requireText('promotionalText',packet.promotionalText,{min:1,max:170});
requireText('description',packet.description,{min:1,max:4000});

const keywordChars=chars(packet.keywords);
if(keywordChars<1||keywordChars>100)fail(`keywords length ${keywordChars} characters exceeds Apple 100-character limit`);
else pass(`keywords length ${keywordChars}/100 characters`);
const keywords=String(packet.keywords||'').split(',').map(x=>x.trim()).filter(Boolean);
if(new Set(keywords).size!==keywords.length)fail('keywords must not contain duplicates');
if(keywords.some(keyword=>keyword.toLowerCase()==='color lab'))fail('keywords should not duplicate the app name');
if(keywords.some(keyword=>chars(keyword)<3))fail('keywords must use 3+ character phrases in this zh-Hant packet');
else pass('keywords use 3+ character phrases');

requireHttps('privacyPolicyUrl',packet.privacyPolicyUrl);
if(packet.marketingUrl)requireHttps('marketingUrl',packet.marketingUrl);

if(packet.signInRequired!==false)fail('v1.0 must not require sign-in');
else pass('sign-in requirement NONE');

const privacy=packet.appPrivacy||{};
for(const key of ['collectsData','tracking','advertising','analyticsSdk','accountData']){
  if(privacy[key]!==false)fail(`appPrivacy.${key} must be false for v1.0`);
}
if(privacy.photosProcessedLocally!==true||privacy.localPaletteProjectDataStaysOnDevice!==true){
  fail('local processing/storage privacy declarations must remain true');
}else pass('local-only photo and palette/project data declaration');

if(packet.encryption?.usesNonExemptEncryption!==false||packet.encryption?.infoPlistKey!=='ITSAppUsesNonExemptEncryption'){
  fail('export-compliance packet must match ITSAppUsesNonExemptEncryption=false');
}else pass('non-exempt encryption declaration');

const age=packet.ageRatingDraft||{};
for(const key of ['unrestrictedWebAccess','userGeneratedPublicContent','messagingOrChat','locationSharing','gamblingOrContests','lootBoxes']){
  if(age[key]!==false)fail(`ageRatingDraft.${key} must be false for current v1.0 behavior`);
}
for(const key of ['violence','sexualContentOrNudity','profanityOrCrudeHumor','alcoholTobaccoOrDrugs','horrorOrFearThemes','medicalOrWellnessAdvice']){
  if(age[key]!=='none')fail(`ageRatingDraft.${key} must be none for current v1.0 behavior`);
}
pass('age-rating behavior draft');

if(packet.plannedPrice!=='Free')fail('v1.0 plannedPrice must remain Free during packaging pass');
else pass('v1.0 no-paywall pricing plan');

externalOrPresent('support-contact',typeof packet.supportUrl==='string'&&packet.supportUrl.length>0,'Support URL');
if(packet.supportUrl)requireHttps('supportUrl',packet.supportUrl);

const contact=packet.reviewContact||{};
externalOrPresent(
  'app-review-contact',
  [contact.name,contact.email,contact.phone].every(value=>typeof value==='string'&&value.trim()),
  'App Review contact'
);
externalOrPresent('copyright',typeof packet.copyright==='string'&&packet.copyright.trim(),'Copyright owner');
externalOrPresent('content-rights',typeof packet.contentRightsAnswer==='boolean','Content Rights answer');
externalOrPresent(
  'dsa-status',
  ['trader','non-trader'].includes(packet.dsaTraderStatus),
  'DSA trader status'
);

const blockerIds=(packet.externalBlockers||[]).map(item=>item?.id);
if(new Set(blockerIds).size!==blockerIds.length)fail('external blocker ids must be unique');
if(!blockerIds.every(Boolean))fail('external blocker ids must be non-empty');

if(failures.length){
  for(const item of failures)console.error('FAIL:',item);
  process.exit(1);
}

console.log(`App Store packet valid: ${path}`);
console.log(`External blockers remaining: ${blockers.length?blockers.join(', '):'none'}`);
