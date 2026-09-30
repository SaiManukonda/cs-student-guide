import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'guest-workspace-'));
try{
 const outfile=join(dir,'test.mjs');
 await build({stdin:{contents:`export * from './app/browser-workspace';export * from './app/workspace-schema';export {emptyPlanner} from './app/rutgers-courses';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
 const {readBrowserWorkspace,writeBrowserWorkspace,importBrowserWorkspace,emptyWorkspace,emptyPlanner}=await import(pathToFileURL(outfile));
 let stored=null;const storage={getItem:()=>stored,setItem:(k,v)=>{stored=v}};
 assert.equal(readBrowserWorkspace(storage),null);
 const local={...emptyWorkspace,planner:emptyPlanner,college:'Rutgers–New Brunswick',projects:['local'],courses:['local:course'],resumeSource:'local resume',applications:[{id:'47a50ed2-9642-49ee-8e16-326374233fa1',company:'Example',role:'Engineer',url:'',status:'Saved',date:'2026-09-30',notes:'',employmentType:'Full-time'}]};
 writeBrowserWorkspace(storage,local);assert.deepEqual(readBrowserWorkspace(storage),local);
 assert.throws(()=>writeBrowserWorkspace({setItem:()=>{throw Error('Quota exceeded')}},local),/could not save/);
 const good=stored;stored='{invalid';assert.throws(()=>readBrowserWorkspace(storage),/not been overwritten/);assert.equal(stored,'{invalid');stored=good;
 const cloud={...local,projects:['cloud'],courses:['cloud:course'],resumeSource:'cloud resume',applications:[{...local.applications[0],status:'Applied'}]};
 const merged=importBrowserWorkspace(local,cloud);assert.deepEqual(merged.projects,['local','cloud']);assert.equal(merged.applications.length,1);assert.equal(merged.applications[0].status,'Applied');assert.equal(merged.resumeSource,'cloud resume');assert.deepEqual(importBrowserWorkspace(local,{...cloud,college:''}),local);
 assert.deepEqual(importBrowserWorkspace(local,merged),merged,'repeated import is idempotent');
 console.log('Guest persistence, storage errors, account import, conflict preservation and repeat import passed.');
}finally{await rm(dir,{recursive:true,force:true});}
