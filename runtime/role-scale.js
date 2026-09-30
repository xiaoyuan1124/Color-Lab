/* Color Lab V2.22 Role Scale / Tonal System — source colors stay authoritative */
const ROLE_SCALE_STOPS=[50,100,200,300,400,500,600,700,800,900];
const ROLE_SCALE_ROLES=[['base','Base'],['structure','Structure'],['accent','Accent']];

function roleScaleAnchorIndex(hex){
  const l=toOKLCH(hex).l;
  const guides=[.97,.93,.86,.78,.69,.59,.49,.39,.29,.19];
  let best=0,dist=Infinity;
  guides.forEach((g,i)=>{const d=Math.abs(l-g);if(d<dist){dist=d;best=i}});
  return best;
}
function roleScaleFor(hex){
  const source=normHex(hex),o=toOKLCH(source),anchor=roleScaleAnchorIndex(source),last=ROLE_SCALE_STOPS.length-1;
  return ROLE_SCALE_STOPS.map((stop,i)=>{
    if(i===anchor)return{stop,hex:source,source:true,l:o.l,c:o.c};
    let l,c;
    if(i<anchor){
      const p=(anchor-i)/Math.max(1,anchor);
      l=o.l+(.975-o.l)*p;
      c=o.c*(1-.55*p);
    }else{
      const p=(i-anchor)/Math.max(1,last-anchor);
      l=o.l+(.13-o.l)*p;
      c=o.c*(1-.30*p);
    }
    const color=gamutMapOKLCH(clamp(l,.04,.985),Math.max(0,c),o.h);
    const mapped=toOKLCH(color);
    return{stop,hex:color,source:false,l:mapped.l,c:mapped.c};
  });
}
function roleScaleSourceIndex(scale){return scale.findIndex(x=>x.source)}
function roleScaleRelative(scale,offset){
  const i=roleScaleSourceIndex(scale);
  return scale[Math.max(0,Math.min(scale.length-1,i+offset))]||scale[i];
}
function roleScaleSystem(){
  const roles={};
  ROLE_SCALE_ROLES.forEach(([key,label])=>{roles[key]={label,source:palette[key],scale:roleScaleFor(palette[key])}});
  return roles;
}
function roleScaleUsage(system=roleScaleSystem()){
  return[
    {token:'Surface subtle',role:'Base',item:roleScaleRelative(system.base.scale,-2)},
    {token:'Surface',role:'Base',item:roleScaleRelative(system.base.scale,0)},
    {token:'Border',role:'Structure',item:roleScaleRelative(system.structure.scale,-2)},
    {token:'Text',role:'Structure',item:roleScaleRelative(system.structure.scale,3)},
    {token:'CTA',role:'Accent',item:roleScaleRelative(system.accent.scale,0)},
    {token:'CTA hover',role:'Accent',item:roleScaleRelative(system.accent.scale,1)}
  ];
}
function roleScaleCssText(){
  const system=roleScaleSystem();
  const lines=['/* Color Lab Role Scale · derived from exact 75 / 18 / 7 sources */',':root {'];
  ROLE_SCALE_ROLES.forEach(([key])=>{
    system[key].scale.forEach(x=>lines.push('  --color-'+key+'-'+x.stop+': '+x.hex+';'+(x.source?' /* exact source */':'')));
    lines.push('  --color-'+key+'-source: '+normHex(system[key].source)+';');
  });
  lines.push('}');
  return lines.join('\n')+'\n';
}
function renderRoleScale(){
  const host=document.querySelector('#roleScale');if(!host)return;
  const system=roleScaleSystem(),usage=roleScaleUsage(system);
  host.innerHTML='<div class="rscale-roles">'+ROLE_SCALE_ROLES.map(([key,label])=>{
    const role=system[key];
    return '<section class="rscale-role" data-role="'+key+'"><div class="rscale-role-head"><strong>'+label+'</strong><span>'+normHex(role.source)+' · anchor</span></div>'+
      '<div class="rscale-strip" aria-label="'+label+' derived tonal scale">'+role.scale.map(x=>
        '<button type="button" class="rscale-swatch'+(x.source?' source':'')+'" data-scale-copy="'+x.hex+'" title="'+label+' '+x.stop+' '+x.hex+'" style="background:'+x.hex+';color:'+textFor(x.hex)+'"><b>'+x.stop+'</b>'+(x.source?'<span>原色</span>':'')+'</button>'
      ).join('')+'</div></section>';
  }).join('')+'</div>'+
  '<div class="rscale-usage"><div class="rscale-usage-head">Suggested roles <span>只引用，不改原色</span></div>'+
    usage.map(x=>'<div class="rscale-token"><i style="background:'+x.item.hex+'"></i><span>'+x.token+'</span><b>'+x.role+' '+x.item.stop+'</b><code>'+x.item.hex+'</code></div>').join('')+
  '</div><div class="rscale-note">色階是衍生工具；Base / Structure / Accent 的 exact source color 永遠保留在各自 anchor。</div>';
}
async function copyRoleScaleCss(){
  const text=roleScaleCssText();
  try{await navigator.clipboard.writeText(text);toast('已複製 Role Scale CSS')}catch(_){toast('無法複製色階')}
}
document.querySelector('#roleScaleDetails')?.addEventListener('toggle',event=>{
  if(event.currentTarget.open)renderRoleScale();
});
document.querySelector('#copyRoleScaleCss')?.addEventListener('click',copyRoleScaleCss);
document.addEventListener('click',event=>{
  const swatch=event.target.closest?.('[data-scale-copy]');
  if(!swatch)return;
  navigator.clipboard?.writeText(swatch.dataset.scaleCopy).then(()=>toast('已複製 '+swatch.dataset.scaleCopy)).catch(()=>{});
});
