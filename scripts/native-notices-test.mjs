import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

// Regression: the actual native copy step must not omit third-party notices.
execFileSync(process.execPath,['scripts/build-native.mjs'],{stdio:'inherit'});
const required=[
  'THIRD_PARTY_NOTICES.md',
  'vendor/iro.LICENSE.txt',
  'vendor/poline.LICENSE.txt',
  'vendor/Sortable.LICENSE.txt',
  'vendor/qrcode.LICENSE.txt',
  'vendor/capacitor.LICENSE.txt',
  'vendor/capacitor-app.LICENSE.txt'
];
for(const file of required){
  assert.ok(fs.existsSync('dist/'+file),'Native bundle missing notice: '+file);
  assert.deepEqual(fs.readFileSync('dist/'+file),fs.readFileSync(file),'Native notice changed: '+file);
}
console.log('Native third-party notice distribution: PASS');
