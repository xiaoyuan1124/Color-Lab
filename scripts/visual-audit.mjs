import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const design=fs.readFileSync('docs/DESIGN_SYSTEM.md','utf8');

let failed=0;
const pass=msg=>console.log('PASS:',msg);
const fail=msg=>{failed++;console.error('FAIL:',msg)};
const check=(ok,msg)=>ok?pass(msg):fail(msg);

check(!html.includes('<nav class="bottom-nav"'),'no permanent bottom tab bar');
check(!html.includes('<nav class="edge-rail"'),'no permanent edge rail');
check(html.includes('class="corner-nav" id="cornerNav"'),'corner navigation is on-demand');
check(html.includes("root.classList.add('nav-scrolling')"),'corner navigation retreats while scrolling');

const fanStart=html.indexOf('/* V2.4.1 CORNER FAN NAVIGATION');
const fanEnd=html.indexOf('/* Library utilities',fanStart);
const fanBlock=fanStart>=0&&fanEnd>fanStart?html.slice(fanStart,fanEnd):'';
check(!!fanBlock,'corner fan style block found');
check(!fanBlock.includes('backdrop-filter:'),'corner fan avoids decorative blur');
check(!fanBlock.includes('linear-gradient('),'corner fan avoids decorative gradient');

check(html.includes('<details class="compose-deep-dive"'),'Compose has progressive disclosure');
check(!html.includes('<details class="compose-deep-dive" id="composeDeepDive" open'),'deep analysis is not forced open');
check(html.includes('YOUR COLOR ARCHIVE'),'Library uses archive framing');
check(html.includes('saved-palette-open'),'saved palette is a first-class action');
check(html.includes('height:118px')||html.includes('height:108px'),'saved color preview has visual weight');

check(design.includes('功能存在不代表功能必須同時可見'),'design system records progressive disclosure');
check(design.includes('不得重新出現固定 Bottom Tab Bar'),'design system records anti-generic navigation gate');

console.log('Color Lab visual quality audit:',failed?failed+' failed':'PASS');
if(failed)process.exit(1);
