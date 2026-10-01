import data from './problems.json';
export type Language = 'javascript' | 'python' | 'java' | 'cpp';
export type ValueType = 'int' | 'long' | 'double' | 'bool' | 'string' | 'int[]' | 'int[][]' | 'string[]' | 'string[][]' | 'tree' | 'list' | 'list[]' | 'graph';
export type Problem = {id:string;name:string;topic:string;level:string;args:{name:string;type:ValueType}[];returns:ValueType;prompt:string;hint:string;tests:{args:unknown[];expected:unknown;label?:string;coverage?:string}[];mode:string;kind:string};
export const problems = data as Problem[];
export const languages: {id:Language;name:string;file:string}[] = [{id:'javascript',name:'JavaScript',file:'solution.js'},{id:'python',name:'Python',file:'solution.py'},{id:'java',name:'Java',file:'Solution.java'},{id:'cpp',name:'C++',file:'solution.cpp'}];
export const listSource = 'https://www.techinterviewhandbook.org/best-practice-questions/';
const types: Record<Language,Record<ValueType,string>> = {
 javascript: {int:'number',long:'number',double:'number',bool:'boolean',string:'string','int[]':'number[]','int[][]':'number[][]','string[]':'string[]','string[][]':'string[][]',tree:'TreeNode | null',list:'ListNode | null','list[]':'(ListNode | null)[]',graph:'Node | null'},
 python: {int:'int',long:'int',double:'float',bool:'bool',string:'str','int[]':'list[int]','int[][]':'list[list[int]]','string[]':'list[str]','string[][]':'list[list[str]]',tree:'Optional[TreeNode]',list:'Optional[ListNode]','list[]':'list[Optional[ListNode]]',graph:'Optional[Node]'},
 java: {int:'int',long:'long',double:'double',bool:'boolean',string:'String','int[]':'int[]','int[][]':'int[][]','string[]':'String[]','string[][]':'String[][]',tree:'TreeNode',list:'ListNode','list[]':'ListNode[]',graph:'Node'},
 cpp: {int:'int',long:'long long',double:'double',bool:'bool',string:'string','int[]':'vector<int>','int[][]':'vector<vector<int>>','string[]':'vector<string>','string[][]':'vector<vector<string>>',tree:'TreeNode*',list:'ListNode*','list[]':'vector<ListNode*>',graph:'Node*'},
};
export function starter(p:Problem,l:Language):string {
 const type=(t:ValueType)=>types[l][t];
 let methods:{name:string;args:{name:string;type:ValueType}[];ret:ValueType|'void'}[]=[{name:'solve',args:p.args,ret:p.returns}];
 let cls='Solution';
 if(p.kind==='strings-codec')methods=[{name:'encode',args:[{name:'strs',type:'string[]'}],ret:'string'},{name:'decode',args:[{name:'data',type:'string'}],ret:'string[]'}];
 if(p.kind==='tree-codec')methods=[{name:'serialize',args:[{name:'root',type:'tree'}],ret:'string'},{name:'deserialize',args:[{name:'data',type:'string'}],ret:'tree'}];
 if(['trie','dictionary','median'].includes(p.kind)){
  cls=p.kind==='trie'?'Trie':p.kind==='dictionary'?'WordDictionary':'MedianFinder';
  methods=p.kind==='trie'?[{name:'insert',args:[{name:'word',type:'string'}],ret:'void'},{name:'search',args:[{name:'word',type:'string'}],ret:'bool'},{name:'startsWith',args:[{name:'prefix',type:'string'}],ret:'bool'}]:p.kind==='dictionary'?[{name:'addWord',args:[{name:'word',type:'string'}],ret:'void'},{name:'search',args:[{name:'word',type:'string'}],ret:'bool'}]:[{name:'addNum',args:[{name:'num',type:'int'}],ret:'void'},{name:'findMedian',args:[],ret:'double'}];
 }
 const structure=p.args.some(a=>['tree','list','list[]','graph'].includes(a.type))||p.kind==='tree-codec';
 const note=structure? (l==='python'?'# ':'// ')+'Provided: ListNode(val, next), TreeNode(val, left, right), Node(val, neighbors).\n':'';
 const design=cls!=='Solution';
 if(l==='javascript')return note+(design?`class ${cls} {\n  constructor() {\n    // Initialize your data structure.\n  }\n\n`:'')+methods.map(m=>`${design?'  ':''}${design?'':'function '}${m.name}(${m.args.map(a=>a.name).join(', ')}) {\n${design?'    ':'  '}throw new Error("Not implemented");\n${design?'  ':''}}`).join('\n\n')+(design?'\n}\n':'\n');
 if(l==='python')return 'from typing import Optional\n\n'+note+(design?`class ${cls}:\n    def __init__(self):\n        # Initialize your data structure.\n        pass\n\n`:'')+methods.map(m=>`${design?'    ':''}def ${m.name}(${[...(design?['self']:[]),...m.args.map(a=>a.name+': '+type(a.type))].join(', ')}) -> ${m.ret==='void'?'None':type(m.ret)}:\n${design?'        ':'    '}raise NotImplementedError("Not implemented")`).join('\n\n')+'\n';
 const prefix=l==='java'?'import java.util.*;\n\n':'#include <bits/stdc++.h>\nusing namespace std;\n\n';
 return prefix+note+`class ${cls} {\n${l==='cpp'?'public:\n':''}`+ (design?`  ${l==='java'?'public ':''}${cls}() {\n    // Initialize your data structure.\n  }\n\n`:'')+methods.map(m=>`  ${l==='java'?'public ':''}${m.ret==='void'?'void':type(m.ret)} ${m.name}(${m.args.map(a=>type(a.type)+' '+a.name).join(', ')}) {\n    throw ${l==='java'?'new UnsupportedOperationException':'runtime_error'}("Not implemented");\n  }`).join('\n\n')+`\n}${l==='cpp'?';':''}\n`;
}
export function example(p:Problem){const t=p.tests[0];const names=p.kind==='cycle'?['values','pos']:['trie','dictionary','median'].includes(p.kind)?['operations','arguments']:p.args.map(a=>a.name);return names.map((n,i)=>`${n} = ${JSON.stringify(t.args[i])}`).join('\n')+'\nOutput: '+JSON.stringify(t.expected)}

// Preserve compatible submissions from the original six-question prototype.
export function canonicalProblemId(id:string){return ({'pair-sum':'two-sum',balanced:'valid-parentheses','max-segment':'maximum-subarray',merge:'merge-intervals'} as Record<string,string>)[id]||id;}
