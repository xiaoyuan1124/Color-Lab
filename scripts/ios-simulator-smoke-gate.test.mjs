import assert from 'node:assert/strict';
import fs from 'node:fs';

// Regression guard: a successful boot request alone is not proof that iOS
// services are ready to install a native app. Do not weaken launch/screenshot gates.
const source=fs.readFileSync('scripts/ios-simulator-smoke.mjs','utf8');
const boot=source.indexOf("simctl('boot fresh simulator',['boot',udid],30000)");
const ready=source.indexOf("simctl('wait for fresh simulator boot readiness',['bootstatus',udid,'-b'],120000)");
const install=source.indexOf("simctl('install Color Lab',['install',udid,APP_PATH],120000)");
assert.ok(boot>=0&&ready>boot&&install>ready,'bootstatus must be awaited between boot and install');
assert.match(source,/for\(let session=1;session<=2;session\+\+\)/,'retain bounded second-session recovery');
assert.match(source,/await waitForLaunchProof\(udid,launchRequest,8\)/,'retain verified app launch PID');
assert.match(source,/await captureScreenshotWithRetry\(udid,3\)/,'retain nonempty screenshot gate');
console.log('PASS: simulator boot readiness and unchanged launch/screenshot regression gates');
