import assert from 'node:assert/strict';
import {median,isLighthouseReport,summarizeLighthouseReports} from './lighthouse-summary.mjs';

const report=(performance,accessibility=100,bestPractices=93,url='http://localhost/index.html')=>({
  finalUrl:url,
  categories:{
    performance:{score:performance/100},
    accessibility:{score:accessibility/100},
    'best-practices':{score:bestPractices/100}
  },
  audits:{}
});

assert.equal(median([79,93,93]),93);
assert.equal(median([80,90]),85);
assert.equal(isLighthouseReport({}),false);
assert.equal(isLighthouseReport({categories:{performance:{score:.93},accessibility:{score:1},'best-practices':{score:.93}}}),true);

const summary=summarizeLighthouseReports(
  [report(79),report(93),report(93)],
  ['first.json','second.json','third.json']
);
assert.deepEqual(summary.scores,{performance:93,accessibility:100,bestPractices:93});
assert.deepEqual(summary.range.performance,[79,93]);
assert.equal(summary.representative.performance,93);
assert.equal(summary.representative.file,'second.json');
assert.deepEqual(summary.outliers.map(x=>x.performance),[79]);

const stable=summarizeLighthouseReports([report(92),report(93),report(94)]);
assert.equal(stable.scores.performance,93);
assert.deepEqual(stable.outliers,[]);

const multiPage=summarizeLighthouseReports(
  [
    report(76),report(93),report(93),
    report(100,100,96,'http://localhost/privacy.html'),
    report(100,100,96,'http://localhost/privacy.html'),
    report(100,100,96,'http://localhost/privacy.html')
  ],
  ['index-1.json','index-2.json','index-3.json','privacy-1.json','privacy-2.json','privacy-3.json']
);
assert.equal(multiPage.scores.performance,93);
assert.deepEqual(multiPage.range.performance,[76,93]);
assert.equal(multiPage.representative.file,'index-2.json');
assert.deepEqual(multiPage.outliers.map(x=>x.performance),[76]);
assert.equal(multiPage.pages.length,2);
assert.equal(multiPage.pages[1].scores.performance,100);

console.log('Lighthouse summary tests: PASS');
