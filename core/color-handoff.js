/* Color Lab V2.51.0 Professional Handoff Color Math
   Pure local-only conversion helpers.
   Lab follows CSS Color 4: sRGB D65 -> XYZ -> Bradford D50 -> CIELAB.
   CMYK is an unprofiled sRGB mathematical reference only, not an ICC print conversion.
   No storage, network, source ordering, or palette mutation. */

const HANDOFF_D50=[0.9642956764295677,1,0.8251046025104601];
const HANDOFF_D65_TO_D50=[
  [1.0479298208405488,0.022946793341019088,-0.05019222954313557],
  [0.029627815688159344,0.990434484573249,-0.01707382502938514],
  [-0.009243058152591178,0.015055144896577895,0.7518742899580008]
];
const HANDOFF_XYZ_D65_TO_P3=[
  [2.4934969119414245,-0.9313836179191236,-0.40271078445071684],
  [-0.829488969561575,1.7626640603183468,0.02362468584194359],
  [0.03584583024378447,-0.07617238926804182,0.9568845240076872]
];

function handoffMatrixVector(matrix,vector){
  return matrix.map(row=>row[0]*vector[0]+row[1]*vector[1]+row[2]*vector[2]);
}
function handoffXyzD65(hex){
  const h=normHex(String(hex||''));if(!h)return null;
  const [r,g,b]=hexToRgb(h).map(srgbToLinear);
  return[
    .41239079926595934*r+.35758433938387796*g+.1804807884018343*b,
    .21263900587151027*r+.7151686787677559*g+.07219231536073371*b,
    .01933081871559182*r+.11919477979462599*g+.9505321522496607*b
  ];
}
function handoffXyzD50(hex){
  const xyz=handoffXyzD65(hex);
  return xyz?handoffMatrixVector(HANDOFF_D65_TO_D50,xyz):null;
}
function hexToLabD50(hex){
  const xyz=handoffXyzD50(hex);if(!xyz)return null;
  const epsilon=216/24389,kappa=24389/27;
  const f=xyz.map((value,index)=>{
    const t=value/HANDOFF_D50[index];
    return t>epsilon?Math.cbrt(t):(kappa*t+16)/116;
  });
  return Object.freeze({l:116*f[1]-16,a:500*(f[0]-f[1]),b:200*(f[1]-f[2]),whitePoint:'D50'});
}
function hexToCmykReference(hex){
  const h=normHex(String(hex||''));if(!h)return null;
  const [r,g,b]=hexToRgb(h),k=1-Math.max(r,g,b);
  if(k>=1-1e-12)return Object.freeze({c:0,m:0,y:0,k:100,method:'unprofiled-srgb-reference'});
  const scale=1-k;
  return Object.freeze({
    c:(1-r-k)/scale*100,
    m:(1-g-k)/scale*100,
    y:(1-b-k)/scale*100,
    k:k*100,
    method:'unprofiled-srgb-reference'
  });
}
function hexToDisplayP3(hex){
  const xyz=handoffXyzD65(hex);if(!xyz)return null;
  const linear=handoffMatrixVector(HANDOFF_XYZ_D65_TO_P3,xyz);
  const rgb=linear.map(linearToSrgb).map(v=>Math.abs(v)<1e-12?0:v);
  return Object.freeze({r:rgb[0],g:rgb[1],b:rgb[2],space:'display-p3',inGamut:rgb.every(v=>v>=-1e-9&&v<=1+1e-9)});
}
function displayP3CssFromHex(hex,digits=6){
  const p=hexToDisplayP3(hex);if(!p)return null;
  const f=v=>String(Number(Math.min(1,Math.max(0,v)).toFixed(digits)));
  return 'color(display-p3 '+f(p.r)+' '+f(p.g)+' '+f(p.b)+')';
}
function professionalColorValues(hex){
  const h=normHex(String(hex||''));if(!h)return null;
  return Object.freeze({hex:h,lab:hexToLabD50(h),cmyk:hexToCmykReference(h),p3:hexToDisplayP3(h)});
}
