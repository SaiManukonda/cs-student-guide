import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'project-lab-'));
try{
 const outfile=join(dir,'test.mjs');
 await build({stdin:{contents:`export * from './app/project-lab/course';export * from './app/project-lab/preview';export * from './app/workspace-schema';export * from './app/browser-workspace';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
 const m=await import(pathToFileURL(outfile));
 const progress={...m.freshLab(),lesson:6,files:m.checkpoint(6),completed:[0,1,2,3,4,5,6],storage:{taskboard:'[]'}};
 assert.ok(m.projectLabSchema.safeParse(progress).success);
 for(let i=-1;i<7;i++){const f=m.checkpoint(i);assert.deepEqual(Object.keys(f),['index.html','styles.css','app.js']);assert.doesNotThrow(()=>new Function(f['app.js']));}
 const html=m.buildPreview({...progress.files,'app.js':'console.log("</script><script>escaped</script>")'},{token:'test',lesson:6,check:false,storage:{}});
 assert.equal((html.match(/<script>/g)||[]).length,1,'user code cannot break out of bootstrap script');
 assert.ok(!html.includes('<script>escaped'));
 assert.match(html,/connect-src 'none'/);
 const script=html.match(/<script>([\s\S]*)<\/script>/)[1];assert.doesNotThrow(()=>new Function(script));
 const state={...m.emptyWorkspace,college:'Rutgers–New Brunswick',projectLabs:{'taskboard-basics':progress}};
 const storage=new Map();const api={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 m.writeBrowserWorkspace(api,state);assert.deepEqual(m.readBrowserWorkspace(api).projectLabs,state.projectLabs);
 const cloud={...m.readBrowserWorkspace(api),projectLabs:{}};
 assert.deepEqual(m.importBrowserWorkspace(m.readBrowserWorkspace(api),cloud).projectLabs,state.projectLabs,'guest project imports into account');
 const cloudProgress={...progress,lesson:2};cloud.projectLabs={'taskboard-basics':cloudProgress};
 assert.equal(m.importBrowserWorkspace(m.readBrowserWorkspace(api),cloud).projectLabs['taskboard-basics'].lesson,2,'existing account project wins as a unit');
 assert.deepEqual(m.workspaceSchema.parse({...state,projectLabs:undefined}).projectLabs,{},'legacy state supported');
 assert.ok(!m.projectLabSchema.safeParse({...progress,files:{...progress.files,'app.js':'x'.repeat(20001)}}).success);
 assert.ok(!m.projectLabSchema.safeParse({...progress,lesson:7}).success);
 assert.ok(!m.projectLabSchema.safeParse({...progress,storage:{data:'x'.repeat(10001)}}).success);
 console.log('Project lab: checkpoint syntax, preview escaping, state limits, guest persistence, account import and legacy state passed.');
}finally{await rm(dir,{recursive:true,force:true})}
