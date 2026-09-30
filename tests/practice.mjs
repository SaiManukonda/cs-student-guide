// Run: node tests/practice.mjs
// Uses authored fixtures only; application code always runs in a remote sandbox.
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const dir=await mkdtemp(join(tmpdir(),'campus-practice-'));
try{
 for(const name of ['catalog','engine'])await build({entryPoints:[`app/practice-data/${name}.ts`],bundle:true,platform:'node',format:'esm',outfile:join(dir,name+'.mjs')});
 const {problems,languages,starter}=await import(pathToFileURL(join(dir,'catalog.mjs')));
 const {buildProgram,grade,accepts}=await import(pathToFileURL(join(dir,'engine.mjs')));
 assert.equal(problems.length,75);assert.equal(new Set(problems.map(p=>p.id)).size,75);
 for(const p of problems){assert.match(p.id,/^[a-z0-9-]+$/);assert.ok(p.tests.length>=4);for(const t of p.tests)assert.ok(accepts(p,t.args,t.expected,t.expected),p.id);for(const l of languages)assert.ok(starter(p,l.id).length>50);new vm.Script(buildProgram(p,'javascript',starter(p,'javascript'),true));}
 const run=(id,code)=>{const p=problems.find(p=>p.id===id),lines=[];vm.runInNewContext(buildProgram(p,'javascript',code,true),{console:{log:x=>lines.push(x)}},{timeout:1500});return grade(p,true,lines.join('\n'));};
 const fixtures={
  'two-sum':`function solve(a,t){for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]+a[j]===t)return [j,i];}`,
  'reverse-linked-list':`function solve(head){let prev=null;while(head){const next=head.next;head.next=prev;prev=head;head=next;}return prev;}`,
  'linked-list-cycle':`function solve(head){let slow=head,fast=head;while(fast&&fast.next){slow=slow.next;fast=fast.next.next;if(slow===fast)return true;}return false;}`,
  'maximum-depth-of-binary-tree':`function solve(root){return root?1+Math.max(solve(root.left),solve(root.right)):0;}`,
  'invert-binary-tree':`function solve(root){if(root){const l=root.left;root.left=solve(root.right);root.right=solve(l);}return root;}`,
  'clone-graph':`function solve(root){const m=new Map();function clone(n){if(!n)return null;if(m.has(n))return m.get(n);const c=new Node(n.val);m.set(n,c);c.neighbors=n.neighbors.map(clone);return c;}return clone(root);}`,
  'encode-and-decode-strings':`function encode(strs){return JSON.stringify(strs);}function decode(data){return JSON.parse(data);}`,
  'serialize-and-deserialize-binary-tree':`function serialize(root){return JSON.stringify(root);}function deserialize(data){function node(v){return v?new TreeNode(v.val,node(v.left),node(v.right)):null;}return node(JSON.parse(data));}`,
  'implement-trie-prefix-tree':`class Trie{constructor(){this.words=new Set();}insert(w){this.words.add(w);}search(w){return this.words.has(w);}startsWith(p){return [...this.words].some(w=>w.startsWith(p));}}`,
  'design-add-and-search-words-data-structure':`class WordDictionary{constructor(){this.words=[];}addWord(w){this.words.push(w);}search(p){return this.words.some(w=>w.length===p.length&&[...p].every((c,i)=>c==='.'||c===w[i]));}}`,
  'find-median-from-data-stream':`class MedianFinder{constructor(){this.a=[];}addNum(n){this.a.push(n);this.a.sort((a,b)=>a-b);}findMedian(){const m=this.a.length>>1;return this.a.length%2?this.a[m]:(this.a[m-1]+this.a[m])/2;}}`,
  'word-search-ii':`function solve(board,words){const out=[];function search(r,c,w,i,used){if(r<0||c<0||r>=board.length||c>=board[0].length||used.has(r+','+c)||board[r][c]!==w[i])return false;if(i===w.length-1)return true;used.add(r+','+c);const ok=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>search(r+a,c+b,w,i+1,used));used.delete(r+','+c);return ok;}for(const w of words)if(board.some((row,r)=>row.some((_,c)=>search(r,c,w,0,new Set()))))out.push(w);return out;}`,
 };
 for(const [id,code]of Object.entries(fixtures)){const r=run(id,code);assert.equal(r.passed,r.total,id+': '+r.details.join('; '));}
 assert.equal(run('clone-graph','function solve(node){return node;}').passed,1,'Original graph nodes must not pass as a deep copy');
 assert.equal(run('two-sum','function solve(){return [0,0];}').passed,0);
 assert.equal(run('reverse-linked-list','function solve(head){if(head)head.next=head;return head;}').passed,1,'Returned cycles must be rejected');
 const pal=problems.find(p=>p.mode==='palindrome'),alien=problems.find(p=>p.mode==='alien');
 assert.ok(accepts(pal,['babad'],'bab','aba'));assert.ok(!accepts(pal,['babad'],'bab','bad'));
 assert.ok(accepts(alien,[['za','zb','ca','cb']],'zacb','azbc'));assert.ok(!accepts(alien,[['za','zb','ca','cb']],'zacb','abcz'));
 assert.ok(!accepts(alien,[['a','b']],'ab','aa'));
 const two=problems[0];assert.equal(grade(two,true,'not a result').passed,0);assert.equal(grade(two,true,'__CAMPUS_CASE__invalid').passed,0);
 console.log('Verified 75 problems, 300 cases, 300 starters; node adapters, design problems, alternate-answer grading, and invalid outputs.');
}finally{await rm(dir,{recursive:true,force:true});}
