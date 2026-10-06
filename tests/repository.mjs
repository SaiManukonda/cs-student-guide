import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'compsci-repository-'));
try{
 const outfile=join(dir,'test.mjs');await build({stdin:{contents:`export * from './app/interview/repository';export * from './app/workspace-schema';export * from './app/browser-workspace';`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',outfile});
 const m=await import(pathToFileURL(outfile)),fresh=m.freshRepo();
 const solved=JSON.parse(await readFile('tests/repository-solutions.json','utf8'));
 const programs=[m.repoProgram(fresh.files),m.repoProgram(solved),m.repoProgram(fresh.files)];
 const path=join(dir,'programs.json');await writeFile(path,JSON.stringify(programs));
 const r=spawnSync('python3',['-c',`import json,sys,types
# Render only is stubbed; the app and unittest execute unchanged.
pandas=types.ModuleType('pandas');pandas.DataFrame=lambda rows:rows;sys.modules['pandas']=pandas
scope={'display':lambda rows:None}
for i,code in enumerate(json.load(open(sys.argv[1]))):
 exec(code,scope)
 rows=scope['repo_results']
 assert len(rows)==18,rows
 passed=sum(r['result']=='PASS' for r in rows)
 if i==1: assert passed==18,rows
 else: assert passed<12,rows
 print('Run',i+1,':',passed,'/18')
`,path],{encoding:'utf8'});assert.equal(r.status,0,r.stderr+'\n'+r.stdout);console.log(r.stdout.trim());
 assert.ok(m.repoSessionSchema.safeParse(fresh).success);
 assert.ok(!m.repoSessionSchema.safeParse({...fresh,files:{...fresh.files,'../bad.py':'x'}}).success);
 assert.ok(!m.repoSessionSchema.safeParse({...fresh,selected:['missing.py']}).success);
 assert.ok(!m.repoSessionSchema.safeParse({...fresh,selected:[fresh.selected[0],fresh.selected[0]]}).success);
 const context=m.selectedContext({...fresh,selected:['supportdesk/routing.py','supportdesk/sla.py']});
 assert.ok(context.includes('choose_ticket')&&context.includes('SLA_HOURS'));assert.ok(!context.includes('class Notifier'));
 assert.equal(m.selectedContext({...fresh,selected:[]}), '');
 assert.ok(m.selectedContext({...fresh,selected:m.fileNames}).length>m.contextLimit);
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const state={...m.emptyWorkspace,college:'Rutgers–New Brunswick',repoSessions:{[m.repoId]:fresh}};
 m.writeBrowserWorkspace(storage,state);const local=m.readBrowserWorkspace(storage);assert.deepEqual(local.repoSessions,state.repoSessions);
 assert.deepEqual(m.importBrowserWorkspace(local,{...local,repoSessions:{}}).repoSessions,state.repoSessions);
 const cloud={...local,repoSessions:{[m.repoId]:{...fresh,notes:'Cloud notes'}}};assert.deepEqual(m.importBrowserWorkspace(local,cloud).repoSessions,cloud.repoSessions);
 console.log('Repository isolation, context selection, schema and persistence passed.');
}finally{await rm(dir,{recursive:true,force:true})}
