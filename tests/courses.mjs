import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'campus-courses-'));
try{
const file=join(dir,'courses.mjs');await build({entryPoints:['app/rutgers-courses.ts'],bundle:true,platform:'node',format:'esm',outfile:file});
const {courses,degreeProgress,courseKey,emptyPlanner,sequences}=await import(pathToFileURL(file));
const calculate=(codes,patch={})=>degreeProgress(codes.map(courseKey),{...emptyPlanner,...patch});
assert.equal(courses.filter(c=>c.category==='Elective').length,55);assert.equal(new Set(courses.map(c=>c.code)).size,courses.length);
const core=courses.filter(c=>c.category.endsWith('core')).map(c=>c.code);
assert.equal(core.length,9);assert.equal(calculate([]).majorPercent,0);
assert.equal(calculate(core).credits,35);assert.equal(calculate(core).creditPercent,29);
const electiveCodes=['210','213','214','314','323','336','352'].map(n=>'01:198:'+n);
const full=[...core,...electiveCodes,...sequences[0].codes];
assert.equal(calculate(full).majorPercent,100);assert.equal(calculate(full).scienceComplete,true);
assert.equal(calculate(full,{otherCredits:90}).creditPercent,100);
assert.equal(calculate(full.slice(0,-1)).scienceComplete,false);assert.ok(calculate(full.slice(0,-1)).majorPercent<100);
const nonCS=courses.filter(c=>c.category==='Elective'&&c.department!=='Computer Science').map(c=>c.code);
assert.equal(calculate(nonCS).electives,2);assert.equal(calculate(nonCS).nbElectives,0);
assert.equal(calculate(['01:198:210','01:198:213','01:198:214',...nonCS]).electives,5);
const independent=['01:198:493','01:198:494'];assert.equal(calculate(independent).electives,0);assert.equal(calculate(independent,{approvedIndependent:independent}).electives,1);
assert.equal(calculate(['01:198:493'],{creditOverrides:{'01:198:493':2}}).credits,2);
assert.equal(calculate([],{statuses:{'01:198:111':'In progress','01:198:112':'Planned'}}).credits,0);
assert.equal(calculate(full,{transfer:full}).nbCount,0);assert.ok(calculate(full,{transfer:full}).majorPercent<100);
assert.equal(calculate([...core,...electiveCodes],{degree:'BA'}).majorPercent,100);
// Extra NB electives cannot satisfy BA residency when only five may count toward the major.
const transferredCore=core.filter(c=>c.startsWith('01:198:'));
assert.equal(calculate([...core,...electiveCodes],{degree:'BA',transfer:transferredCore}).nbCount,5);
assert.ok(calculate([...core,...electiveCodes],{degree:'BA',transfer:transferredCore}).majorPercent<100);
assert.equal(calculate(['01:198:111','01:198:111']).credits,4);
assert.equal(calculate(['01:198:111'],{creditOverrides:{'01:198:111':0}}).credits,0);
assert.equal(calculate(['01:750:203','01:750:194']).scienceComplete,false);
console.log('Course planner: 55 electives, credit totals, distributions, residency, science, and legacy completion keys passed.');
}finally{await rm(dir,{recursive:true,force:true})}
