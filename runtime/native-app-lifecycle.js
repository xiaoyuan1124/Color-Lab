/* Color Lab native App lifecycle bridge. Web/PWA: no-op. */
(function(g){
  let handle=null;
  async function persist(){
    try{g.persistDraft?.()}catch(_){}
    try{await g.writeResilienceSnapshot?.()}catch(_){}
  }
  async function init(){
    if(!g.isNativeAppShell?.()||handle)return handle;
    const app=g.Capacitor?.Plugins?.App;
    if(!app?.addListener)return null;
    try{
      handle=await app.addListener('appStateChange',async state=>{
        if(!state?.isActive)await persist();
      });
      return handle;
    }catch(_){return null}
  }
  g.initNativeAppLifecycle=init;
})(globalThis);
