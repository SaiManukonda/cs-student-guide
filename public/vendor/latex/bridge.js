/* Isolated compiler bridge. Engine source and license: ./NOTICE.txt */
let engine;
let busy=false;
addEventListener('message',async event=>{
 if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='compile-resume'||busy)return;
 const {id,source}=event.data;
 if(typeof source!=='string'||source.length>100000)return;
 busy=true;
 const reply=data=>parent.postMessage({type:'resume-result',id,...data},location.origin);
 const timer=setTimeout(()=>{engine?.latexWorker?.terminate();engine=undefined;busy=false;reply({error:'Compilation timed out. Check your LaTeX and retry.',log:'The compiler was stopped after 60 seconds.'})},60000);
 try{
  if(!engine){engine=new PdfTeXEngine();await engine.loadEngine();engine.latexWorker.postMessage({cmd:'settexliveurl',url:'https://texlive.texlyre.org/'});}
  engine.flushCache();engine.writeMemFSFile('resume.tex',source);engine.setEngineMainFile('resume.tex');
  const result=await engine.compileLaTeX();
  if(result.pdf&&result.status===0)reply({pdf:result.pdf,log:result.log});
  else reply({error:'LaTeX could not compile. Check the log below for the line to fix.',log:result.log});
 }catch(e){engine?.latexWorker?.terminate();engine=undefined;reply({error:'The compiler could not start. Please retry or download your source for Overleaf.',log:String(e)})}
 finally{clearTimeout(timer);busy=false;}
});
