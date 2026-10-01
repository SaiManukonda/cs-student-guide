import type {Language,Problem,ValueType} from './catalog';
import {jsRuntime,pyRuntime,javaRuntime,cppRuntime} from './runtime';
export const compiler: Record<Language,string>={javascript:'nodejs-20.17.0',python:'cpython-3.12.7',java:'openjdk-jdk-21+35',cpp:'gcc-13.2.0'};
export const marker='__CAMPUS_CASE__';
function literal(v:unknown,t:ValueType,l:Language):string {
 if(t==='tree'){
  if(l==='java')return `Helpers.tree(new Integer[]{${(v as unknown[]).map(x=>x===null?'null':x).join(',')}})`;
  if(l==='cpp')return `Harness::tree({${(v as unknown[]).map(x=>x===null?'2147483648LL':x).join(',')}})`;
  return `tree(${literal(v,'int[]',l)})`;
 }
 if(t==='graph')return `${l==='java'?'Helpers.':l==='cpp'?'Harness::':''}graph(${literal(v,'int[][]',l)})`;
 if(t==='list')return `${l==='java'?'Helpers.list':l==='cpp'?'Harness::list':l==='python'?'make_list':'list'}(${literal(v,'int[]',l)},-1)`;
 if(t==='list[]')return (l==='java'?'new ListNode[]{':l==='cpp'?'vector<ListNode*>{':'[')+(v as unknown[]).map(x=>literal(x,'list',l)).join(',')+(l==='java'||l==='cpp'?'}':']');
 if(t.endsWith('[]')){
  const base=t.slice(0,-2) as ValueType;
  const pre=l==='java'?'new '+({'int[]':'int[]','int[][]':'int[][]','string[]':'String[]','string[][]':'String[][]'} as Record<string,string>)[t]+'{':l==='cpp'?({'int[]':'vector<int>','int[][]':'vector<vector<int>>','string[]':'vector<string>','string[][]':'vector<vector<string>>'} as Record<string,string>)[t]+'{':'[';
  return pre+(v as unknown[]).map(x=>literal(x,base,l)).join(',')+(l==='java'||l==='cpp'?'}':']');
 }
 if(v===null)return l==='python'?'None':'null';
 if(typeof v==='boolean')return l==='python'?(v?'True':'False'):String(v);
 if(typeof v==='string')return JSON.stringify(v);
 return String(v)+(t==='long'?(l==='java'?'L':l==='cpp'?'LL':''):'');
}
export function buildProgram(p:Problem,l:Language,code:string,all:boolean):string {
 const cases=all?p.tests:p.tests.slice(0,1);
 const bodies=cases.map((test,index)=>{
  const py=l==='python',js=l==='javascript',java=l==='java',cpp=l==='cpp';
  const end=py?'':';',decl=py?'':js?'const ':java?'var ':'auto ';
  let body:string[]=[];
  const special=['trie','dictionary','median'].includes(p.kind);
  const cls=p.kind==='trie'?'Trie':p.kind==='dictionary'?'WordDictionary':p.kind==='median'?'MedianFinder':'Solution';
  if(java||cpp||special)body.push(`${decl}solution = ${cpp?cls+'()':py?cls+'()':'new '+cls+'()'}${end}`);
  if(special){
   body.push(py?'answer = []':js?'const answer = [];':java?'var answer = new ArrayList<Object>();':`vector<${p.kind==='median'?'double':'bool'}> answer;`);
   (test.args[0] as string[]).forEach((op,i)=>{const query=['search','startsWith','findMedian'].includes(op);const a=op==='findMedian'?'':literal((test.args[1] as unknown[])[i],p.kind==='median'?'int':'string',l);const call=`solution.${op}(${a})`;body.push(query?(py?`answer.append(${call})`:js?`answer.push(${call});`:java?`answer.add(${call});`:`answer.push_back(${call});`):call+end);});
  }else{
   p.args.forEach((arg,i)=>{
    let value=literal(test.args[i],arg.type,l);
    if(p.kind==='cycle')value=`${java?'Helpers.list':cpp?'Harness::list':py?'make_list':'list'}(${literal(test.args[0],'int[]',l)},${test.args[1]})`;
    body.push(`${decl}arg${i} = ${value}${end}`);
   });
   const prefix=java||cpp?'solution.':'';
   const call=p.kind==='strings-codec'?`${prefix}decode(${prefix}encode(arg0))`:p.kind==='tree-codec'?`${prefix}deserialize(${prefix}serialize(arg0))`:`${prefix}solve(${p.args.map((_,i)=>'arg'+i).join(',')})`;
   body.push(`${decl}answer = ${call}${end}`);
   if(p.returns==='graph')body.push(`${java?'Helpers.assertClone':cpp?'Harness::assertClone':py?'assert_clone':'assertClone'}(arg0,answer)${end}`);
  }
  const kind=special?'normal':p.returns;
  if(js){body.push(`console.log(${JSON.stringify(marker)}+JSON.stringify({index:${index},value:pack(answer,${JSON.stringify(kind)})}));`);return `try {\n${body.join('\n')}\n} catch(e) {console.log(${JSON.stringify(marker)}+JSON.stringify({index:${index},error:String(e.message||e)}));}`;}
  if(py){body.push(`print(${JSON.stringify(marker)} + json.dumps({'index':${index},'value':pack(answer,${JSON.stringify(kind)})}))`);return `try:\n${body.map(x=>'    '+x).join('\n')}\nexcept Exception as e:\n    print(${JSON.stringify(marker)} + json.dumps({'index':${index},'error':str(e)}))`;}
  if(java){body.push(`System.out.println(${JSON.stringify(marker+'{"index":'+index+',"value":')}+Helpers.json(Helpers.pack(answer,${JSON.stringify(kind)}))+"}");`);return `try {\n${body.join('\n')}\n} catch(Throwable e) {System.out.println(${JSON.stringify(marker+'{"index":'+index+',"error":')}+Helpers.json(e.toString())+"}");}`;}
  body.push(`cout << ${JSON.stringify(marker+'{"index":'+index+',"value":')} << Harness::json(answer) << "}" << endl;`);
  return `try {\n${body.join('\n')}\n} catch(const exception& e) {cout << ${JSON.stringify(marker+'{"index":'+index+',"error":')} << Harness::json(string(e.what())) << "}" << endl;}`;
 });
 if(l==='javascript')return jsRuntime+'\n'+code+'\n'+bodies.join('\n');
 if(l==='python')return pyRuntime+'\n'+code+'\n'+bodies.join('\n');
 if(l==='java'){
  // Java import declarations must precede the supplied node classes.
  const imports=code.match(/^\s*import\s+[^;]+;/gm)||[];
  return 'import java.util.*;\n'+imports.join('\n')+'\n'+javaRuntime+'\n'+code.replace(/^\s*import\s+[^;]+;/gm,'')+'\nclass Wandbox {\n'+bodies.map((body,i)=>'static void case'+i+'(){\n'+body+'\n}').join('\n')+'\npublic static void main(String[] args) {\n'+bodies.map((_,i)=>'case'+i+'();').join('\n')+'\n}}';
 }
 return '#include <bits/stdc++.h>\nusing namespace std;\n'+cppRuntime+'\n'+code+'\nint main(){\n'+bodies.join('\n')+'\nreturn 0;\n}';
}
const canonical=(x:unknown)=>JSON.stringify(x);
function ordered(x:unknown,nested=false):unknown {
 if(!Array.isArray(x))return x;
 return x.map(v=>nested&&Array.isArray(v)?[...v].sort((a,b)=>canonical(a).localeCompare(canonical(b))):v).sort((a,b)=>canonical(a).localeCompare(canonical(b)));
}
export function accepts(p:Problem,input:unknown[],expected:unknown,actual:unknown):boolean {
 if(p.id==='minimum-window-substring'){
  if(typeof actual!=='string'||actual.length!==(expected as string).length||!(input[0] as string).includes(actual))return false;
  if(expected==='')return actual==='';
  const counts=new Map<string,number>();for(const c of actual)counts.set(c,(counts.get(c)||0)+1);
  for(const c of input[1] as string){const n=counts.get(c)||0;if(!n)return false;counts.set(c,n-1)}return true;
 }
 if(p.id==='two-sum')return Array.isArray(actual)&&actual.length===2&&actual.every(i=>Number.isInteger(i)&&i>=0&&i<(input[0] as number[]).length)&&actual[0]!==actual[1]&&(input[0] as number[])[actual[0]]+(input[0] as number[])[actual[1]]===input[1];
 if(p.mode==='alien'){
  if(typeof actual!=='string')return false;
  if(expected==='')return actual==='';
  const words=input[0] as string[],letters=new Set(words.join(''));
  if(actual.length!==letters.size||new Set(actual).size!==letters.size||[...actual].some(c=>!letters.has(c)))return false;
  const rank=new Map([...actual].map((c,i)=>[c,i]));
  for(let i=1;i<words.length;i++){const a=words[i-1],b=words[i];let j=0;while(j<a.length&&j<b.length&&a[j]===b[j])j++;if(j===b.length&&a.length>b.length)return false;if(j<a.length&&j<b.length&&rank.get(a[j])!>=rank.get(b[j])!)return false;}return true;
 }
 if(p.mode==='palindrome')return typeof actual==='string'&&actual.length===(expected as string).length&&(input[0] as string).includes(actual)&&actual===[...actual].reverse().join('');
 if(p.mode==='graph')return Array.isArray(actual)&&canonical(actual.map(a=>ordered(a)))===canonical((expected as unknown[]).map(a=>ordered(a)));
 if(p.mode==='unordered'||p.mode==='nested')return Array.isArray(actual)&&canonical(ordered(actual,p.mode==='nested'))===canonical(ordered(expected,p.mode==='nested'));
 return canonical(actual)===canonical(expected);
}
export type RunResult={passed:number;total:number;details:string[]};
export function grade(p:Problem,all:boolean,stdout:string):RunResult {
 const cases=all?p.tests:p.tests.slice(0,1),rows=new Map<number,{value?:unknown;error?:string}>();
 for(const line of stdout.split('\n')){if(!line.startsWith(marker))continue;try{const row=JSON.parse(line.slice(marker.length));if(Number.isInteger(row.index)&&row.index>=0&&row.index<cases.length)rows.set(row.index,row);}catch{/* Treat malformed output as a failed case. */}}
 let passed=0;const details=cases.map((t,i)=>{const row=rows.get(i),name=`Case ${i+1}${t.label?' — '+t.label:''}`;if(!row)return `${name}: no result (the program stopped or exceeded its limit).`;if(row.error)return `${name}: ${String(row.error).slice(0,600)}`;const ok=accepts(p,t.args,t.expected,row.value);if(ok){passed++;return `${name}: passed`;}return `${name}: expected ${canonical(t.expected).slice(0,250)}; received ${String(canonical(row.value)).slice(0,250)}`;});return {passed,total:cases.length,details};
}
