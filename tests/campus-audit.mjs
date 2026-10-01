import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'campus-audit-'));
try{
 const outfile=join(dir,'audit.mjs');
 await build({stdin:{contents:`export * from './app/campus-audit';export * from './app/campus-plan';export * from './app/campus-programs';export * from './app/thread-rules';import threads from './app/gatech-threads.json';export {threads};`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
 const {campusAudit,campusCourses,emptyCampusPlan,assignSlots,threadRules,threads}=await import(pathToFileURL(outfile));
 const audit=(id,codes,patch={})=>campusAudit(id,codes.map(c=>id+':'+c),{...emptyCampusPlan,...patch});
 const row=(a,id)=>a.rows.find(r=>r.id===id);
 assert.deepEqual(assignSlots([{options:['A','B'],count:1},{options:['A'],count:1}],new Set(['A','B'])),[['B'],['A']]);
 for(const id of ['umd','uiuc','vt','gatech']){
  assert.equal(audit(id,[]).percent,0);
  assert.equal(campusAudit(id,['rutgers:CS 1114'],emptyCampusPlan).percent,0);
  assert.equal(audit(id,[],{statuses:{'CS 1114':'In progress','CMSC 131':'Planned'},checks:['distribution','advanced','technical']}).percent,0,'manual legacy checks and planned courses do not award progress');
 }
 const umd=['CMSC 411','CMSC 412','CMSC 414','CMSC 420','CMSC 471','CMSC 320','CMSC 335'];
 let a=audit('umd',umd);assert.equal(row(a,'distribution').complete,true);assert.equal(row(a,'electives').complete,true);
 assert.equal(new Set([...row(a,'distribution').completed,...row(a,'electives').completed]).size,7);
 assert.equal(row(audit('umd',umd.filter(c=>c!=='CMSC 471')),'distribution').complete,false);
 assert.equal(row(audit('umd',['CMSC 411','CMSC 412','CMSC 414','CMSC 416','CMSC 417']),'distribution').complete,false);
 a=audit('umd',['CMSC 460','CMSC 466']);assert.equal(row(a,'distribution').earned,1);assert.equal(row(a,'electives').earned,0);
 a=audit('umd',['CMSC 498B']);assert.equal(row(a,'distribution').earned,0,'semester-restricted topics must not be silently approved');
 a=audit('uiuc',['CS 411','CS 412','CS 440','CS 450','CS 473','CS 483']);
 assert.equal(row(a,'technical').complete,true);assert.equal(row(a,'focus').complete,true);assert.equal(row(a,'team').complete,true);assert.equal(row(a,'advanced').complete,false);
 a=audit('uiuc',['CS 400','CS 401','CS 402','CS 403','CS 421','CS 491']);assert.equal(row(a,'technical').earned,0);
 assert.equal(row(audit('uiuc',['CS 425']),'team').complete,false);
 assert.equal(row(audit('uiuc',['CS 425'],{creditOverrides:{'CS 425':4}}),'team').complete,true);
 assert.equal(row(audit('uiuc',['CS 411'],{creditOverrides:{'CS 411':0}}),'technical').earned,0);
 a=audit('uiuc',['CS 397','CS 499'],{creditOverrides:{'CS 397':6,'CS 499':6}});assert.match(row(a,'technical').detail,/6 \/ 18/);
 a=audit('vt',['CS 4104','CS 4094','CS 4604','CS 3704','CS 3724','CS 4804']);
 assert.ok(a.rows.filter(r=>r.id.startsWith('vt-')).every(r=>r.complete));
 const allocated=a.rows.filter(r=>r.id.startsWith('vt-')).flatMap(r=>r.completed);assert.equal(allocated.length,new Set(allocated).size);
 assert.equal(row(audit('vt',['CS 4104']),'vt-0').complete,true);assert.equal(row(audit('vt',['CS 4104']),'vt-2').complete,false);
 assert.equal(row(audit('vt',['CS 3634']),'vt-3').earned,0);
 assert.equal(threads.length,36);
 for(const pair of threads){
  const rules=threadRules(pair.name);assert.ok(rules.length>15,pair.name);
  assert.ok(rules.every(r=>r.options.length&&r.count>0&&r.credits>0),pair.name+' valid rules');
  const available=new Set(campusCourses('gatech').map(c=>c.code));
  for(const r of rules)for(const c of r.options.flat())assert.ok(available.has(c),pair.name+' missing '+c);
  a=audit('gatech',[],{track:pair.name});assert.equal(a.percent,0);
 }
 const pair=threads[0];
 a=audit('gatech',['CS 2050','CS 2051'],{track:pair.name});assert.equal(a.rows.filter(r=>r.completed.includes('CS 2050')||r.completed.includes('CS 2051')).length,1);
 a=audit('gatech',['ISYE 2027'],{track:pair.name});assert.equal(a.rows.filter(r=>r.completed.includes('ISYE 2027')).length,0);
 a=audit('gatech',['ISYE 2027','ISYE 3030'],{track:pair.name});assert.equal(a.rows.filter(r=>r.completed.includes('ISYE 2027')).length,1);
 assert.equal(row(audit('gatech',['CS 3311','CS 3312','LMC 3431','LMC 3432'],{track:pair.name}),'junior').complete,true);
 assert.equal(row(audit('gatech',['CS 3311','CS 3312'],{track:pair.name}),'junior').complete,false);
 console.log('Automatic course audits passed: all four schools, 36 Thread pairs, elective allocation, equivalencies, area/focus rules, credits, bundles, school isolation and legacy checks.');
}finally{await rm(dir,{recursive:true,force:true})}
