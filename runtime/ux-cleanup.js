/* Color Lab V2.31.0 Deep Dive UX
   Progressive disclosure for understanding, validation, and application. */

const DEEP_DIVE_SECTIONS=['deepUnderstanding','deepValidation','deepApplication'];
const DEEP_DIVE_SECTION_KEY='colorlab.deepSection';
let deepDiveUxBound=false;
let deepDiveAccordionSync=false;

function deepDiveSectionOpen(id){
  return !!document.getElementById(id)?.open;
}
function deepDivePreferredSection(){
  const saved=storageReadRaw(DEEP_DIVE_SECTION_KEY,'deepUnderstanding');
  return DEEP_DIVE_SECTIONS.includes(saved)?saved:'deepUnderstanding';
}
function ensureDeepDiveSection(){
  const open=DEEP_DIVE_SECTIONS.find(id=>deepDiveSectionOpen(id));
  if(open)return open;
  const preferred=deepDivePreferredSection();
  const target=document.getElementById(preferred)||document.getElementById('deepUnderstanding');
  if(target)target.open=true;
  return target?.id||'';
}
function renderDeepDiveVisible(){
  const deep=document.getElementById('composeDeepDive');
  if(!deep?.open)return;
  const section=ensureDeepDiveSection();

  if(section==='deepUnderstanding'){
    renderRelationshipExplanation();
    renderColorRelationshipMap();
    renderToneExplorer();
    if(document.getElementById('roleScaleDetails')?.open)renderRoleScale();
  }else if(section==='deepValidation'){
    renderPaletteValidation();
    renderVision();
  }else if(section==='deepApplication'){
    renderContextPreview();
    if(document.getElementById('gradientStudioDetails')?.open)renderGradientStudio();
    if(document.getElementById('customDesignPreviewDetails')?.open)renderCustomDesignPreview();
  }
}
function openDeepDiveSection(id){
  if(!DEEP_DIVE_SECTIONS.includes(id))return;
  deepDiveAccordionSync=true;
  DEEP_DIVE_SECTIONS.forEach(sectionId=>{
    const node=document.getElementById(sectionId);
    if(node)node.open=sectionId===id;
  });
  deepDiveAccordionSync=false;
  storageWriteRaw(DEEP_DIVE_SECTION_KEY,id,{silent:true});
  requestAnimationFrame(renderDeepDiveVisible);
}
function initDeepDiveUx(){
  if(deepDiveUxBound)return;
  const deep=document.getElementById('composeDeepDive');if(!deep)return;
  deepDiveUxBound=true;

  DEEP_DIVE_SECTIONS.forEach(id=>{
    const section=document.getElementById(id);if(!section)return;
    section.addEventListener('toggle',event=>{
      if(deepDiveAccordionSync||!event.currentTarget.open)return;
      openDeepDiveSection(id);
    });
  });

  deep.addEventListener('toggle',event=>{
    if(!event.currentTarget.open)return;
    const preferred=deepDivePreferredSection();
    openDeepDiveSection(preferred);
  });

  if(deep.open)openDeepDiveSection(deepDivePreferredSection());
}
