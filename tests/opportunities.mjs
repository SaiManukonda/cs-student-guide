import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'job-types-'));
const originalFetch=globalThis.fetch;
try{
 const outfile=join(dir,'test.mjs');
 await build({stdin:{contents:`export {GET} from './app/api/opportunities/route';export * from './app/workspace-schema';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
 const {GET,workspaceSchema,emptyWorkspace}=await import(pathToFileURL(outfile));
 const application={id:'47a50ed2-9642-49ee-8e16-326374233fa1',company:'Example',role:'Software engineer',url:'',status:'Saved',date:'2026-09-30',notes:''};
 const state={...emptyWorkspace,college:'Rutgers–New Brunswick',applications:[application]};
 assert.equal(workspaceSchema.parse(state).applications[0].employmentType,'Not specified');
 for(const employmentType of ['Internship','Full-time'])assert.equal(workspaceSchema.parse({...state,applications:[{...application,employmentType}]}).applications[0].employmentType,employmentType);
 let mode='down';
 globalThis.fetch=async url=>{
  if(mode==='down'||(mode==='partial'&&String(url).includes('New-Grad')))return new Response('',{status:503});
  const job={id:'same-id',active:true,is_visible:true,company_name:'Example',title:'Engineer',url:'https://example.com/job',date_posted:1};
  return Response.json([job,{...job,id:'closed',active:false},{...job,id:'hidden',is_visible:false},{...job,id:'unsafe',url:'javascript:alert(1)'}]);
 };
 assert.equal((await GET()).status,503);
 mode='partial';const partial=await (await GET()).json();assert.equal(partial.jobs.length,1);assert.match(partial.warning,/Full-time/);
 mode='ok';const complete=await (await GET()).json();assert.equal(complete.jobs.length,2);assert.equal(new Set(complete.jobs.map(j=>j.id)).size,2);assert.deepEqual(complete.jobs.map(j=>j.employmentType).sort(),['Full-time','Internship']);assert.equal(complete.warning,undefined);
 console.log('Job feed types, partial outages, filtering, and saved application compatibility passed.');
}finally{globalThis.fetch=originalFetch;await rm(dir,{recursive:true,force:true});}
