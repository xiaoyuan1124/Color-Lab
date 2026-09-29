import fs from 'node:fs';

const dir='.lighthouseci-reports';
if(!fs.existsSync(dir)){
  console.log('No Lighthouse report directory found');
  process.exit(0);
}
const files=fs.readdirSync(dir).filter(x=>x.endsWith('.json'));
if(!files.length){
  console.log('No Lighthouse JSON report found');
  process.exit(0);
}
const report=JSON.parse(fs.readFileSync(dir+'/'+files[0],'utf8'));
const c=report.categories||{};
console.log('Lighthouse scores',{
  performance:Math.round((c.performance?.score||0)*100),
  accessibility:Math.round((c.accessibility?.score||0)*100),
  bestPractices:Math.round((c['best-practices']?.score||0)*100)
});

const audits=Object.values(report.audits||{})
  .filter(a=>a&&a.details&&Number.isFinite(a.numericValue)&&a.score!==1)
  .sort((a,b)=>(b.numericValue||0)-(a.numericValue||0))
  .slice(0,12)
  .map(a=>({
    id:a.id,
    title:a.title,
    score:a.score,
    numericValue:Math.round(a.numericValue||0),
    displayValue:a.displayValue||''
  }));
console.log('Lighthouse top audits');
for(const a of audits)console.log(JSON.stringify(a));


const accessibilityRefs=c.accessibility?.auditRefs||[];
const accessibilityFailures=accessibilityRefs
  .map(ref=>report.audits?.[ref.id])
  .filter(a=>a&&a.score!==1&&a.scoreDisplayMode!=='notApplicable')
  .map(a=>({id:a.id,title:a.title,score:a.score,displayValue:a.displayValue||''}));
console.log('Lighthouse accessibility failures');
for(const a of accessibilityFailures)console.log(JSON.stringify(a));


console.log('Lighthouse accessibility nodes');
for(const failure of accessibilityFailures){
  const audit=report.audits?.[failure.id];
  const items=audit?.details?.items||[];
  for(const item of items.slice(0,8)){
    const node=item.node||{};
    console.log(JSON.stringify({
      audit:failure.id,
      selector:node.selector||'',
      snippet:node.snippet||'',
      explanation:node.explanation||item.explanation||''
    }));
  }
}


const metricIds=['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','interactive','cumulative-layout-shift','mainthread-work-breakdown'];
console.log('Lighthouse performance metrics');
for(const id of metricIds){
  const a=report.audits?.[id];
  if(a)console.log(JSON.stringify({id,title:a.title,score:a.score,numericValue:Math.round((a.numericValue||0)*100)/100,displayValue:a.displayValue||''}));
}
