import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function median(values){
  const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!sorted.length)return 0;
  const mid=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
}
function scorePercent(report,key){
  return Math.round((report?.categories?.[key]?.score||0)*100);
}
export function summarizeLighthouseReports(reports,files=[]){
  const runs=reports.map((report,index)=>({
    index,
    file:files[index]||'run-'+(index+1),
    performance:scorePercent(report,'performance'),
    accessibility:scorePercent(report,'accessibility'),
    bestPractices:scorePercent(report,'best-practices')
  }));
  const performance=median(runs.map(x=>x.performance));
  const accessibility=median(runs.map(x=>x.accessibility));
  const bestPractices=median(runs.map(x=>x.bestPractices));
  const sorted=[...runs].sort((a,b)=>Math.abs(a.performance-performance)-Math.abs(b.performance-performance)||a.index-b.index);
  const representative=sorted[0]||{index:0,file:'',performance:0,accessibility:0,bestPractices:0};
  const perfValues=runs.map(x=>x.performance);
  const minPerformance=perfValues.length?Math.min(...perfValues):0;
  const maxPerformance=perfValues.length?Math.max(...perfValues):0;
  const outliers=runs.filter(x=>Math.abs(x.performance-performance)>=10);
  return{
    runs,
    scores:{performance,accessibility,bestPractices},
    range:{performance:[minPerformance,maxPerformance]},
    representative,
    outliers
  };
}

export function readLighthouseReports(dir='.lighthouseci-reports'){
  if(!fs.existsSync(dir))return{files:[],reports:[]};
  const files=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort();
  const reports=files.map(file=>JSON.parse(fs.readFileSync(path.join(dir,file),'utf8')));
  return{files,reports};
}

export function printLighthouseSummary(dir='.lighthouseci-reports'){
  const {files,reports}=readLighthouseReports(dir);
  if(!files.length){
    console.log(fs.existsSync(dir)?'No Lighthouse JSON report found':'No Lighthouse report directory found');
    return null;
  }
  const summary=summarizeLighthouseReports(reports,files);
  console.log('Lighthouse scores',{
    performance:summary.scores.performance,
    accessibility:summary.scores.accessibility,
    bestPractices:summary.scores.bestPractices,
    runs:summary.runs.length,
    performanceRange:summary.range.performance.join('-')
  });
  console.log('Lighthouse run scores');
  for(const run of summary.runs)console.log(JSON.stringify(run));
  if(summary.outliers.length){
    console.log('Lighthouse performance outliers');
    for(const run of summary.outliers)console.log(JSON.stringify({
      file:run.file,
      performance:run.performance,
      median:summary.scores.performance,
      delta:run.performance-summary.scores.performance
    }));
  }

  const report=reports[summary.representative.index]||reports[0];
  console.log('Lighthouse representative report',JSON.stringify(summary.representative));
  const c=report.categories||{};
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
  return summary;
}

const isDirect=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isDirect)printLighthouseSummary();
