import assert from 'node:assert/strict';
import {median,summarizeLighthouseReports} from './lighthouse-summary.mjs';

const report=(performance,accessibility=100,bestPractices=93)=>({
  categories:{
    performance:{score:performance/100},
    accessibility:{score:accessibility/100},
    'best-practices':{score:bestPractices/100}
  },
  audits:{}
});

assert.equal(median([79,93,93]),93);
assert.equal(median([80,90]),85);

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

console.log('Lighthouse summary tests: PASS');
