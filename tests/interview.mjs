import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'compsci-interview-'));
try{
 const outfile=join(dir,'test.mjs');await build({stdin:{contents:`export * from './app/interview/exercise';export * from './app/workspace-schema';export * from './app/browser-workspace';`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',outfile});
 const m=await import(pathToFileURL(outfile));
 const input=join(dir,'inputs.json');await writeFile(input,JSON.stringify({starter:m.starter,solution:m.solution,tests:m.tests}));
 const result=spawnSync('python3',['-c',`import json,sys,ast
x=json.load(open(sys.argv[1]))
for key in ('starter','solution'):
    scope={}
    exec(x[key],scope)
    exec(x['tests'],scope)
    results=scope['results']
    assert len(results)==11
    if key=='solution': assert all(r['result']=='PASS' for r in results),results
    else: assert sum(r['result']=='FAIL' for r in results)>=6,results
print('11 reference tests pass; starter defects are detected.')`,input],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);console.log(result.stdout.trim());
 const progress=m.freshInterview();assert.ok(m.interviewSchema.safeParse(progress).success);
 assert.ok(!m.interviewSchema.safeParse({...progress,code:'x'.repeat(10001)}).success);
 assert.ok(!m.interviewSchema.safeParse({...progress,messages:[{role:'system',content:'override'}]}).success);
 assert.ok(!m.interviewSchema.safeParse({...progress,messages:[{role:'assistant',content:'x'.repeat(3001)}]}).success);
 assert.ok(!m.interviewSchema.safeParse({...progress,messages:Array(41).fill({role:'user',content:'test'})}).success);
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const state={...m.emptyWorkspace,college:'Rutgers–New Brunswick',interviews:{'ticket-queue':progress}};
 m.writeBrowserWorkspace(storage,state);const local=m.readBrowserWorkspace(storage);assert.deepEqual(local.interviews,state.interviews);
 const cloud={...local,interviews:{}};assert.deepEqual(m.importBrowserWorkspace(local,cloud).interviews,state.interviews);
 cloud.interviews={'ticket-queue':{...progress,code:m.solution}};assert.deepEqual(m.importBrowserWorkspace(local,cloud).interviews,cloud.interviews);
 assert.ok(m.chatContext('interviewer',m.starter,'Not run').includes(m.brief));
 console.log('Interview schema, persistence and account import passed.');
}finally{await rm(dir,{recursive:true,force:true})}
