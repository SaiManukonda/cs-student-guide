import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'compsci-notebook-'));
try{
 const outfile=join(dir,'test.mjs');
 await build({stdin:{contents:`export * from './app/project-lab/notebook-course';export * from './app/workspace-schema';export * from './app/browser-workspace';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
 const m=await import(pathToFileURL(outfile));const progress=m.freshNotebook();
 assert.ok(m.notebookSchema.safeParse(progress).success);
 const notebook=m.exportNotebook(progress);assert.equal(notebook.nbformat,4);assert.equal(notebook.cells.length,12);assert.equal(notebook.cells.filter(c=>c.cell_type==='code').length,6);
 assert.equal(new Set(notebook.cells.map(c=>c.id)).size,notebook.cells.length);
 assert.ok(notebook.cells.find(c=>c.id==='load').source.includes('order_id,day,item'));
 const source=join(dir,'cells.json');await writeFile(source,JSON.stringify(m.notebookLessons.flatMap(l=>[l.starter,l.solution,l.check])));
 const python=spawnSync('python3',['-c','import ast,json,sys\nfor code in json.load(open(sys.argv[1])): ast.parse(code)',source],{encoding:'utf8'});assert.equal(python.status,0,python.stderr);
 const state={...m.emptyWorkspace,college:'Rutgers–New Brunswick',notebooks:{'campus-sales':progress}};
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 m.writeBrowserWorkspace(storage,state);const local=m.readBrowserWorkspace(storage);assert.deepEqual(local.notebooks,state.notebooks);
 const cloud={...local,notebooks:{}};assert.deepEqual(m.importBrowserWorkspace(local,cloud).notebooks,state.notebooks);
 cloud.notebooks={'campus-sales':{...progress,completed:['load']}};assert.deepEqual(m.importBrowserWorkspace(local,cloud).notebooks,cloud.notebooks);
 assert.deepEqual(m.workspaceSchema.parse({...state,notebooks:undefined}).notebooks,{});
 assert.ok(!m.notebookSchema.safeParse({...progress,cells:[...progress.cells,progress.cells[0]]}).success);
 assert.ok(!m.notebookSchema.safeParse({...progress,cells:progress.cells.slice(1)}).success);
 assert.ok(!m.notebookSchema.safeParse({...progress,cells:progress.cells.map(c=>({...c,source:'x'.repeat(20001)}))}).success);
 console.log('Notebook checks passed: cell syntax, standalone Jupyter export, schema bounds, guest persistence, account import and legacy state.');
}finally{await rm(dir,{recursive:true,force:true})}
