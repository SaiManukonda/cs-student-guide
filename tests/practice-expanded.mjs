import assert from 'node:assert/strict';
import vm from 'node:vm';
import {reference} from './practice-reference.mjs';
import {build} from 'esbuild';
import {mkdtemp,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'practice-expanded-'));
try{
 for(const name of ['catalog','engine'])await build({entryPoints:[`app/practice-data/${name}.ts`],bundle:true,platform:'node',format:'esm',outfile:join(dir,name+'.mjs')});
 const {problems,starter}=await import(pathToFileURL(join(dir,'catalog.mjs'))),{buildProgram,grade,accepts}=await import(pathToFileURL(join(dir,'engine.mjs')));
 let pythonFiles=[];let largest=0;
 for(const p of problems){
  assert.ok(p.tests.length>=24);assert.equal(p.tests.length,new Set(p.tests.map(t=>JSON.stringify(t.args))).size,p.id+' duplicated fixtures');
  assert.ok(p.tests.some(t=>t.coverage==='edge'));assert.ok(p.tests.some(t=>t.coverage==='generated'));
  const output=p.tests.map((t,index)=>'__CAMPUS_CASE__'+JSON.stringify({index,value:t.expected})).join('\n');
  assert.ok(Buffer.byteLength(output)<256000,p.id+' exceeds output allowance');
  assert.equal(grade(p,true,output).passed,p.tests.length);
  for(const language of ['javascript','python','java','cpp']){const program=buildProgram(p,language,starter(p,language),true);largest=Math.max(largest,program.length);assert.ok(program.length<400000,p.id+' source too large');if(language==='python'){const file=join(dir,p.id+'.py');await writeFile(file,program);pythonFiles.push(file)}}
 }
 execFileSync('python3',['-m','py_compile',...pythonFiles],{timeout:30000});
 // Independent, deliberately simple algorithms validate generated oracle results.
 const brute={
  'best-time-to-buy-and-sell-stock':([a])=>{let best=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)best=Math.max(best,a[j]-a[i]);return best},
  'maximum-subarray':([a])=>{let best=-Infinity;for(let i=0;i<a.length;i++){let sum=0;for(let j=i;j<a.length;j++){sum+=a[j];best=Math.max(best,sum)}}return best},
  'maximum-product-subarray':([a])=>{let best=-Infinity;for(let i=0;i<a.length;i++){let product=1;for(let j=i;j<a.length;j++){product*=a[j];best=Math.max(best,product)}}return best},
  'container-with-most-water':([a])=>{let best=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)best=Math.max(best,(j-i)*Math.min(a[i],a[j]));return best},
  'longest-increasing-subsequence':([a])=>{const dp=a.map(()=>1);for(let i=0;i<a.length;i++)for(let j=0;j<i;j++)if(a[i]>a[j])dp[i]=Math.max(dp[i],dp[j]+1);return dp.length?Math.max(...dp):0},
  'longest-substring-without-repeating-characters':([s])=>{let best=0;for(let i=0;i<s.length;i++){const set=new Set();for(let j=i;j<s.length&&!set.has(s[j]);j++){set.add(s[j]);best=Math.max(best,set.size)}}return best},
  'longest-repeating-character-replacement':([s,k])=>{let best=0;for(let i=0;i<s.length;i++){const freq={};for(let j=i;j<s.length;j++){freq[s[j]]=(freq[s[j]]||0)+1;if(j-i+1-Math.max(...Object.values(freq))<=k)best=Math.max(best,j-i+1)}}return best},
  'coin-change':([coins,n])=>{const q=[[0,0]],seen=new Set([0]);for(const [amount,depth]of q){if(amount===n)return depth;for(const c of coins)if(amount+c<=n&&!seen.has(amount+c)){seen.add(amount+c);q.push([amount+c,depth+1])}}return -1},
  'unique-paths':([m,n])=>{let r=1n;for(let i=1;i<m;i++)r=r*BigInt(n+i-1)/BigInt(i);return Number(r)},
  'product-of-array-except-self':([a])=>{const out=Array(a.length).fill(1);let l=1,r=1;for(let i=0;i<a.length;i++){out[i]*=l;l*=a[i];out[a.length-1-i]*=r;r*=a[a.length-1-i]}return out},
 };
 let checked=0;for(const p of problems)if(brute[p.id])for(const t of p.tests){if(p.id==='longest-repeating-character-replacement'&&t.args[0].length>100)continue;assert.ok(accepts(p,t.args,t.expected,brute[p.id](t.args)),p.id+' '+t.label);checked++}
 // Ensure common incorrect approaches are caught by the expanded suites.
 const bugs={
  'best-time-to-buy-and-sell-stock':([a])=>Math.max(...a)-Math.min(...a),
  'jump-game':([a])=>a.every(v=>v>0),
  'longest-increasing-subsequence':([a])=>new Set(a).size,
  'number-of-islands':([a])=>a.flat().filter(v=>v==='1').length,
  'valid-parentheses':([a])=>a.split('(').length===a.split(')').length,
  'decode-ways':([s])=>s.length,
  'house-robber-ii':([a])=>a.filter((_,i)=>i%2===0).reduce((s,v)=>s+v,0),
 };
 for(const [id,bug]of Object.entries(bugs)){const p=problems.find(p=>p.id===id);assert.ok(p.tests.slice(4).some(t=>!accepts(p,t.args,t.expected,bug(t.args))),id+' did not catch mutation')}
 const smoke={
  'maximum-subarray':{java:'class Solution { public int solve(int[] a){int best=a[0],sum=0;for(int x:a){sum=Math.max(x,sum+x);best=Math.max(best,sum);}return best;} }',cpp:'class Solution { public: int solve(vector<int> a){int best=a[0],sum=0;for(int x:a){sum=max(x,sum+x);best=max(best,sum);}return best;} };',python:'def solve(a):\n    best=a[0]\n    current=0\n    for x in a:\n        current=max(x,current+x)\n        best=max(best,current)\n    return best'},
  'reverse-linked-list':{java:'class Solution { public ListNode solve(ListNode head){ListNode prev=null;while(head!=null){ListNode next=head.next;head.next=prev;prev=head;head=next;}return prev;} }'},
  'serialize-and-deserialize-binary-tree':{java:'class Solution { Map<String,TreeNode> saved=new HashMap<>(); public String serialize(TreeNode root){saved.put("x",root);return "x";} public TreeNode deserialize(String s){return saved.get(s);} }'},
  'find-median-from-data-stream':{java:'class MedianFinder { List<Integer> a=new ArrayList<>(); public void addNum(int n){a.add(n);Collections.sort(a);} public double findMedian(){int m=a.size()/2;return a.size()%2==1?a.get(m):((double)a.get(m-1)+a.get(m))/2;} }'},
  'number-of-1-bits':{java:'class Solution { public int solve(long n){return Long.bitCount(n);} }'},
  'pacific-atlantic-water-flow':{java:null},
 };
 // Exercise every ordinary problem's input/output adapters against the reference.
 let adapterSuites=0;
 for(const p of problems.filter(p=>p.kind==='normal')){
  const packed=p.args.map((a,i)=>a.type==='list[]'?`arg${i}.map(v=>pack(v,'list'))`:`pack(arg${i},${JSON.stringify(a.type)})`).join(',');
  const output=p.returns==='tree'?"tree(result)":p.returns==='list'?"list(result)":p.returns==='graph'?"graph(result)":"result";
  const code=`function solve(${p.args.map((_,i)=>'arg'+i).join(',')}){const result=oracle(${JSON.stringify(p.id)},[${packed}]);return ${output};}`;
  const lines=[];vm.runInNewContext(buildProgram(p,'javascript',code,true),{oracle:reference,console:{log:s=>lines.push(s)}},{timeout:5000});
  const result=grade(p,true,lines.join('\n'));assert.equal(result.passed,result.total,p.id+' adapters: '+result.details.filter(d=>!d.endsWith('passed')).join('; '));adapterSuites++;
 }
 // Platform-independent aggregate header for the local Clang smoke check.
 const bits=join(dir,'bits');await mkdir(bits);await writeFile(join(bits,'stdc++.h'),['algorithm','array','climits','cmath','functional','iomanip','iostream','map','queue','set','sstream','stack','stdexcept','string','unordered_map','unordered_set','vector'].map(x=>`#include <${x}>`).join('\n'));
 let compiled=0;
 for(const [id,langs]of Object.entries(smoke))for(const [language,solution]of Object.entries(langs)){
  const p=problems.find(p=>p.id===id),program=buildProgram(p,language,solution||starter(p,language),true);let output;
  if(language==='java'){const file=join(dir,'Wandbox.java');await writeFile(file,program);execFileSync('javac',[file],{timeout:30000});if(solution)output=execFileSync('java',['-cp',dir,'Wandbox'],{timeout:15000}).toString()}
  if(language==='python'){const file=join(dir,'run.py');await writeFile(file,program);output=execFileSync('python3',[file],{timeout:15000}).toString()}
  if(language==='cpp'){const file=join(dir,'run.cpp'),exe=join(dir,'run');await writeFile(file,program);execFileSync('clang++',['-std=c++17','-O1','-I',dir,file,'-o',exe],{timeout:30000});output=execFileSync(exe,[],{timeout:15000}).toString()}
  if(output){const result=grade(p,true,output);assert.equal(result.passed,result.total,id+' '+language+': '+result.details.filter(d=>!d.endsWith('passed')).join('; '))}
  compiled++;
 }
 console.log(`Expanded coverage passed: ${adapterSuites} complete JavaScript adapter suites, ${checked} independent oracle checks, ${pythonFiles.length} Python syntax checks, ${compiled} compiled/executed smoke suites, mutation checks, and all output/source budgets (largest source ${largest} bytes).`);
}finally{await rm(dir,{recursive:true,force:true});}
