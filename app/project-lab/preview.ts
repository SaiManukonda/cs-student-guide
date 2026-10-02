import type {ProjectFiles} from './course';
export type CheckResult={label:string;passed:boolean;detail:string};
type RunOptions={token:string;lesson:number;check:boolean;storage:Record<string,string>};
// This entire function runs inside an opaque-origin sandbox, never in the host app.
function runtime(files:ProjectFiles,options:RunOptions){
 const send=(type:string,payload:unknown)=>parent.postMessage({channel:'compsciguide-project',token:options.token,type,payload},'*');
 let writes=0;const stored:Record<string,string>={...options.storage};
 const store={getItem:(key:string)=>stored[key]??null,setItem:(key:string,value:string)=>{key=String(key);value=String(value);if(key.length>120||value.length>10000)throw Error('Preview storage value is too large.');if(!Object.hasOwn(stored,key)&&Object.keys(stored).length>=20)throw Error('Preview storage is full.');stored[key]=value;writes++;send('storage',stored)},removeItem:(key:string)=>{delete stored[key];writes++;send('storage',stored)},clear:()=>{Object.keys(stored).forEach(k=>delete stored[k]);writes++;send('storage',stored)},key:(i:number)=>Object.keys(stored)[i]??null,get length(){return Object.keys(stored).length}};
 Object.defineProperty(window,'localStorage',{value:store});
 let error=false;
 addEventListener('error',e=>{error=true;send('error',e.message+(e.lineno?' (line '+e.lineno+')':''))});
 window.addEventListener('unhandledrejection',(e:PromiseRejectionEvent)=>{error=true;send('error',String(e.reason))});
 let logCount=0;for(const level of ['log','warn','error'] as const){console[level]=(...values:unknown[])=>{if(logCount++<100)send('console',values.map(v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch{return String(v)}}).join(' ').slice(0,1500))}}
 const parsed=new DOMParser().parseFromString(files['index.html'],'text/html');
 // Project imports are deliberately limited to the three editable files.
 parsed.querySelectorAll('script,link,base,iframe,object,embed,meta[http-equiv]').forEach(e=>e.remove());
 document.body.replaceChildren(...Array.from(parsed.body.childNodes).map(n=>document.importNode(n,true)));
 const style=document.createElement('style');style.textContent=files['styles.css'];document.head.appendChild(style);
 const script=document.createElement('script');script.textContent=files['app.js']+'\n//# sourceURL=app.js';document.body.appendChild(script);
 if(!options.check){send('ready',null);return;}
 setTimeout(()=>{
  const results:CheckResult[]=[];
  const test=(label:string,fn:()=>void)=>{try{fn();results.push({label,passed:true,detail:''})}catch(e){results.push({label,passed:false,detail:e instanceof Error?e.message:String(e)})}};
  const assert=(condition:unknown,message:string)=>{if(!condition)throw Error(message)};
  const form=document.querySelector<HTMLFormElement>('#task-form');
  const input=document.querySelector<HTMLInputElement>('#task-title');
  const list=document.querySelector('#task-list');
  const items=()=>Array.from(list?.querySelectorAll<HTMLElement>('.task')||[]);
  const add=(title:string)=>{assert(form&&input,'Add #task-form and #task-title first.');input!.value=title;form!.requestSubmit();};
  const title=(el:HTMLElement)=>el.querySelector<HTMLInputElement>('input[type="text"]')?.value;
  test('Page structure',()=>assert(document.querySelector('h1')&&form&&input&&list&&document.querySelector('#task-count')&&form.querySelector('button[type="submit"]')&&document.querySelector('label[for="task-title"]'),'Add the heading, labeled input, submit button, count and list with the IDs in the lesson.'));
  if(options.lesson>=1)test('Responsive layout',()=>{const main=document.querySelector('main'),row=document.querySelector('.add-row');assert(main&&row,'Add main and .add-row.');assert(getComputedStyle(main!).maxWidth!=='none'&&getComputedStyle(row!).display==='flex'&&parseFloat(getComputedStyle(document.body).paddingLeft)>0,'Give main a max-width, .add-row display: flex, and body padding.');});
  if(options.lesson>=2)test('Read task data',()=>{const first=items()[0];assert(first&&title(first)&&first.querySelector('input[type="checkbox"]')&&first.querySelector('button'),'Render a .task row with a title input, checkbox and Delete button.');assert(document.querySelector('#task-count')?.textContent?.trim(),'Show the task count.');});
  if(options.lesson>=3){
   test('Create a task',()=>{const before=items().length;add('Lab check task');assert(items().length===before+1&&items().some(el=>title(el)==='Lab check task'),'Submitting should append exactly one task.');assert(input!.value==='','Clear the input after adding.');});
   test('Reject blank input',()=>{const before=items().length;add('   ');assert(items().length===before,'Ignore whitespace-only input.');});
  }
  if(options.lesson>=4){
   test('Update completion',()=>{const first=items()[0];const checkbox=first?.querySelector<HTMLInputElement>('input[type="checkbox"]');assert(checkbox,'Render a checkbox.');checkbox!.checked=true;checkbox!.dispatchEvent(new Event('change',{bubbles:true}));assert(items()[0]?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked&&items()[0]?.classList.contains('done'),'Update state and render the completed row with class done.');});
   test('Edit a task title',()=>{const before=items().map(title);const edit=items()[0]?.querySelector<HTMLInputElement>('input[type="text"]');assert(edit,'Render a text input.');edit!.value='Renamed by check';edit!.dispatchEvent(new Event('change',{bubbles:true}));add('Force another render');assert(title(items()[0])==='Renamed by check','The edited title must survive re-rendering.');assert(before.slice(1).every((v,i)=>title(items()[i+1])===v),'Editing one task must leave the other records unchanged.');});
  }
  if(options.lesson>=5)test('Delete by identity',()=>{add('Same title');add('Same title');const before=items().length;const twins=items().filter(el=>title(el)==='Same title');twins[0]?.querySelector<HTMLButtonElement>('button')?.click();assert(items().length===before-1&&items().filter(el=>title(el)==='Same title').length===1,'Delete exactly one record even when titles match.');});
  if(options.lesson>=6){
   test('Load saved tasks',()=>assert(items().some(el=>title(el)==='Previously saved task'),'Initialize tasks from localStorage; a saved fixture was supplied to this check.'));
   test('Persist every change',()=>{assert(writes>=7,'Create, update and delete must all write to localStorage.');const saved=JSON.parse(store.getItem('taskboard')||'null');assert(Array.isArray(saved)&&saved.length===items().length&&saved.every((t:{title:string},i:number)=>t.title===title(items()[i])),'Store the current array with JSON.stringify under the taskboard key.');});
  }
  test('No JavaScript errors',()=>assert(!error,'Fix the error shown in the console.'));
  send('checks',results);
 },30);
}
export function buildPreview(files:ProjectFiles,options:RunOptions){
 const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; form-action 'none'; base-uri 'none'"></head><body><script>(${runtime.toString()})(${json(files)},${json(options)});</script></body></html>`;
}
