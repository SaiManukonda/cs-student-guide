import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'campus-universities-'));
try{
 const outfile=join(dir,'test.mjs');
 await build({stdin:{contents:`export * from './app/campus-programs';export * from './app/campus-plan';export * from './app/workspace-schema';export * from './app/university';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import Chooser from './app/university-chooser';export const markup=renderToStaticMarkup(React.createElement(Chooser,{saving:false,onChoose:async()=>true}));`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile,jsx:'automatic',banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"}});
 const {programs,campusCourses,campusProgress,campusCourseKey,emptyCampusPlan,workspaceSchema,emptyWorkspace,universities,universityNames,markup}=await import(pathToFileURL(outfile));
 assert.equal(emptyWorkspace.college,'');
 assert.equal(workspaceSchema.safeParse(emptyWorkspace).success,false,'saving requires an explicit university');
 assert.equal(workspaceSchema.safeParse({...emptyWorkspace,college:'not a school'}).success,false);
 assert.equal(universityNames.length,6);
 assert.equal((markup.match(/type="radio"/g)||[]).length,6);
 assert.ok(!markup.includes('checked=""'),'no default choice');
 assert.match(markup,/<button[^>]*disabled=""/,'Continue disabled before choosing');
 for(const name of universityNames){
  const parsed=workspaceSchema.parse({...emptyWorkspace,college:name});assert.equal(parsed.college,name);
  assert.ok((await readFile('public'+universities[name].logo)).length>100);
 }
 const legacy={...emptyWorkspace,college:'Rutgers–New Brunswick',courses:['Rutgers–New Brunswick:01:198:111']};delete legacy.collegePlans;
 assert.deepEqual(workspaceSchema.parse(legacy).collegePlans,{});
 assert.deepEqual(workspaceSchema.parse(legacy).courses,legacy.courses);
 for(const id of Object.keys(programs)){
  const courses=campusCourses(id);assert.ok(courses.length>=40);assert.equal(courses.length,new Set(courses.map(c=>c.code)).size);
  for(const group of programs[id].core)for(const code of group)assert.ok(courses.some(c=>c.code===code),id+' missing '+code);
  const first=courses.find(c=>c.credits>0&&!c.code.startsWith('APPH '));const done=[campusCourseKey(id,first.code)];
  assert.equal(campusProgress(id,done,emptyCampusPlan).credits,first.credits);
  assert.equal(campusProgress(id,[...done,...done],emptyCampusPlan).credits,first.credits,'duplicate IDs never double count');
  assert.equal(campusProgress(id,done,{...emptyCampusPlan,creditOverrides:{[first.code]:0}}).credits,0);
  assert.equal(campusProgress(id,done,{...emptyCampusPlan,otherCredits:250}).percent,100);
  for(const other of Object.keys(programs).filter(x=>x!==id))assert.equal(campusProgress(other,done,emptyCampusPlan).credits,0,'school progress must be isolated');
  const state=workspaceSchema.parse({...emptyWorkspace,college:universityNames.find(n=>universities[n].id===id),courses:done,collegePlans:{[id]:{...emptyCampusPlan,otherCredits:17}}});
  const switched=workspaceSchema.parse({...state,college:'Rutgers–New Brunswick'});
  assert.deepEqual(switched.collegePlans,state.collegePlans);assert.deepEqual(switched.courses,state.courses);
 }
 const vtUnknown=campusCourses('vt').find(c=>c.credits===null);
 assert.equal(campusProgress('vt',[campusCourseKey('vt',vtUnknown.code)],emptyCampusPlan).unknownCredits,1);
 const threads=JSON.parse(await readFile('app/gatech-threads.json','utf8'));
 assert.equal(threads.length,36);assert.equal(new Set(threads.map(t=>t.name.split(' & ').sort().join('|'))).size,36);
 assert.ok(threads.every(t=>t.requirements.length>60));
 console.log('University validation, onboarding defaults, assets, catalog integrity, credit calculations, legacy compatibility and switching isolation passed.');
}finally{await rm(dir,{recursive:true,force:true})}
