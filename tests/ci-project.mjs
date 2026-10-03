import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'compsci-ci-'));
try{
 const outfile=join(dir,'course.mjs');
 await build({entryPoints:['app/project-lab/ci-course.ts'],bundle:true,platform:'node',format:'esm',outfile});
 const {ciCourse}=await import(pathToFileURL(outfile));
 const cells=join(dir,'cells.json');await writeFile(cells,JSON.stringify(ciCourse.lessons));
 const script=`import json,sys,os,zipfile,io,subprocess
os.chdir(sys.argv[2])
namespace={}
for lesson in json.load(open(sys.argv[1])):
    if lesson['id']=='workflow':
        # YAML structure is tested by the real browser runtime; use its exact source string here.
        exec(lesson['solution'].split('\\nimport yaml')[0], namespace)
    else:
        exec(lesson['solution'], namespace)
        exec(lesson['check'], namespace)
with zipfile.ZipFile(io.BytesIO(namespace['buffer'].getvalue())) as archive:
    assert set(archive.namelist()) == set(namespace['repo_files'])
    archive.extractall('exported')
p=subprocess.run([sys.executable,'-m','unittest','discover','-v'],cwd='exported',capture_output=True,text=True)
assert p.returncode==0,p.stderr
assert 'Ran 4 tests' in p.stderr,p.stderr
p=subprocess.run([sys.executable,'build.py'],cwd='exported',capture_output=True,text=True)
assert p.returncode==0,p.stderr
assert '<h1>My portfolio</h1>' in open('exported/dist/index.html').read()
# A regression in the exported app must fail the actual CI command.
path='exported/app.py'
source=open(path).read()
open(path,'w').write(source.replace('title = title.strip()','title = title'))
p=subprocess.run([sys.executable,'-m','unittest','discover','-v'],cwd='exported',capture_output=True,text=True)
assert p.returncode!=0,'Regression unexpectedly passed'
print('Exported repository: tests pass, build succeeds, regression fails.')
`;
 const result=spawnSync('python3',['-c',script,cells,dir],{encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
 console.log(result.stdout.split('\n').filter(l=>l.startsWith('Exported')).join('\n'));
}finally{await rm(dir,{recursive:true,force:true})}
