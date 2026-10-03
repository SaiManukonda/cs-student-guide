'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,RotateCcw,Square,Download,Plus} from 'lucide-react';
import CodeEditor from '../code-editor';
import {type SavedState,OutLink} from '../workspace';
import {useNotebookKernel,type CellRun} from './notebook-kernel';
import {salesCourse,type NotebookCourse,freshNotebook,exportNotebook,type NotebookProgress,type NotebookOutput} from './notebook-course';
type Props={state:SavedState;save:(s:SavedState)=>Promise<boolean>;saving:boolean;onBack:()=>void;course?:NotebookCourse};
export default function NotebookLab({state,save,saving,onBack,course=salesCourse}:Props){
 const {id:notebookId,lessons:notebookLessons}=course;
 const [notebook,setNotebook]=useState<NotebookProgress>(()=>state.notebooks?.[notebookId]||freshNotebook(notebookLessons));
 const [saved,setSaved]=useState(()=>JSON.stringify(state.notebooks?.[notebookId]||freshNotebook(notebookLessons)));
 const [outputs,setOutputs]=useState<Record<string,CellRun>>({}),[running,setRunning]=useState<string|null>(null),[batch,setBatch]=useState(false),[error,setError]=useState('');
 const [reference,setReference]=useState<string|null>(null),[replace,setReplace]=useState<string|null>(null),[hint,setHint]=useState<string|null>(null);
 const kernel=useNotebookKernel(course.packages),cancel=useRef(false),current=useRef(notebook);current.current=notebook;
 const dirty=JSON.stringify(notebook)!==saved,busy=kernel.busy||batch||running!==null;
 useEffect(()=>{
  const leave=(e:BeforeUnloadEvent)=>{if(JSON.stringify(current.current)!==saved){e.preventDefault();e.returnValue='';}};
  const navigate=(e:MouseEvent)=>{const a=(e.target as HTMLElement).closest('a');if(a&&a.target!=='_blank'&&!a.hasAttribute('download')&&JSON.stringify(current.current)!==saved&&!confirm('You have unsaved notebook changes. Leave without saving?'))e.preventDefault();};
  addEventListener('beforeunload',leave);document.addEventListener('click',navigate,true);
  return()=>{removeEventListener('beforeunload',leave);document.removeEventListener('click',navigate,true)};
 },[saved]);
 function change(id:string,source:string){
  const index=current.current.cells.findIndex(c=>c.id===id);if(current.current.cells[index].source===source)return;
  setNotebook(p=>({...p,cells:p.cells.map(c=>c.id===id?{...c,source}:c),completed:p.completed.filter(done=>p.cells.findIndex(c=>c.id===done)<index)}));
  setOutputs(p=>Object.fromEntries(Object.entries(p).map(([key,value])=>[key,current.current.cells.findIndex(c=>c.id===key)>=index?{...value,invalidated:true}:value])));
 }
 async function runCell(id:string){
  const cell=current.current.cells.find(c=>c.id===id)!;const lesson=notebookLessons.find(l=>l.id===id);setRunning(id);setError('');
  try{
   const result=await kernel.execute(cell.source,lesson?.check||'');setOutputs(p=>({...Object.fromEntries(Object.entries(p).map(([key,value])=>[key,current.current.cells.findIndex(c=>c.id===key)>current.current.cells.findIndex(c=>c.id===id)?{...value,invalidated:true}:value])),[id]:{...result,source:cell.source}}));
   if(lesson)setNotebook(p=>({...p,completed:[...p.completed.filter(done=>p.cells.findIndex(c=>c.id===done)<p.cells.findIndex(c=>c.id===id)),...(!result.error&&!result.checkError?[id]:[])]}));
   return !result.error;
  }catch(e){setError((e as Error).message);return false;}finally{setRunning(null);}
 }
 async function runAll(){cancel.current=false;setBatch(true);try{for(const c of current.current.cells){if(cancel.current||!await runCell(c.id))break;}}finally{setBatch(false);}}
 function restart(){cancel.current=true;kernel.stop();setOutputs({});setRunning(null);setBatch(false);}
 async function persist(){const snapshot=current.current;setError('');if(await save({...state,notebooks:{...state.notebooks,[notebookId]:snapshot}})){setSaved(JSON.stringify(snapshot));return true;}setError('Could not save. Your notebook is still here; try again.');return false;}
 function download(){const url=URL.createObjectURL(new Blob([JSON.stringify(exportNotebook(notebook,notebookLessons),null,2)],{type:'application/x-ipynb+json'}));const a=document.createElement('a');a.href=url;a.download=course.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className="notebook-lab" aria-label={course.title+" notebook"}>
 <button className="text-link project-back" disabled={saving||busy} onClick={async()=>{if(!dirty||await persist())onBack()}}>Back to project library</button>
 <div className="notebook-title"><div><h2>{course.title}</h2><p>{course.stack}</p></div><span>{notebook.completed.length} / {notebookLessons.length} lessons complete</span></div>
 <div className="notebook-toolbar"><button className="primary" disabled={busy} onClick={runAll}><Play size={15}/>Run all</button><button className="secondary" onClick={restart}><RotateCcw size={15}/>{busy?'Stop & restart':'Restart kernel'}</button><button className="secondary" disabled={saving||busy||!dirty} onClick={persist}>{saving?'Saving…':'Save notebook'}</button><button className="secondary" onClick={download}><Download size={15}/>.ipynb</button><span role="status">{kernel.status}</span></div>
 <p className="notebook-help">Run cells from top to bottom. Variables are shared until you restart the kernel. The first run downloads Python and this project’s packages; execution stays in your browser.</p>
 <div className="notebook-save-status"><span>{dirty?'Unsaved changes':'Notebook saved'}</span><span>Saving keeps code and progress. Re-run cells to restore outputs after reopening.</span></div>
 {error&&<p className="notice" role="alert">{error}</p>}
 <nav className="notebook-outline" aria-label="Notebook lessons">{notebookLessons.map((l,i)=><button key={l.id} onClick={()=>document.getElementById('cell-'+l.id)?.scrollIntoView({behavior:'smooth',block:'start'})}>{notebook.completed.includes(l.id)?'✓':i+1} {l.title}</button>)}</nav>
 <div className="notebook-cells">{notebook.cells.map((cell,i)=>{const lesson=notebookLessons.find(l=>l.id===cell.id),output=outputs[cell.id];const stale=!!output&&(output.invalidated||output.source!==cell.source);return <article className="notebook-cell" key={cell.id} id={'cell-'+cell.id}>
 {lesson?<div className="notebook-markdown"><div className="notebook-lesson-label">LESSON {notebookLessons.indexOf(lesson)+1}{notebook.completed.includes(cell.id)&&<span>Checked</span>}</div><h3>{lesson.title}</h3><p className="notebook-goal">{lesson.goal}</p><p>{lesson.body}</p><ol>{lesson.steps.map(s=><li key={s}>{s}</li>)}</ol><div className="notebook-guidance"><button className="text-link" onClick={()=>setHint(hint===cell.id?null:cell.id)}>{hint===cell.id?'Hide hint':'Hint'}</button><button className="text-link" onClick={()=>setReference(reference===cell.id?null:cell.id)}>{reference===cell.id?'Hide solution':'Reference solution'}</button><OutLink href={lesson.source}>Docs</OutLink></div>{hint===cell.id&&<p className="lab-hint">{lesson.hint}</p>}{reference===cell.id&&<div className="notebook-reference"><pre>{lesson.solution}</pre><button className="secondary" disabled={busy} onClick={()=>setReplace(cell.id)}>Use solution in this cell</button></div>}{replace===cell.id&&<div className="lab-confirm"><p>Replace this cell’s code with the reference solution?</p><button className="secondary" onClick={()=>{change(cell.id,lesson.solution);setReplace(null)}}>Replace cell</button><button className="text-link" onClick={()=>setReplace(null)}>Cancel</button></div>}</div>:<div className="notebook-scratch-heading"><h3>Scratch cell</h3><button className="text-link" disabled={busy} onClick={()=>{setNotebook(p=>({...p,cells:p.cells.filter(c=>c.id!==cell.id)}));setOutputs(p=>{const next={...p};delete next[cell.id];return next})}}>Remove cell</button></div>}
 <div className="notebook-code"><div className="notebook-cell-toolbar"><span className="mono">In [{running===cell.id?'*':output?.execution||' '}]</span><span>{lesson?'Python · '+lesson.title:'Python · Scratch cell'}</span><button className="secondary" aria-label={'Run cell '+(i+1)} disabled={busy} onClick={()=>{cancel.current=false;runCell(cell.id)}}><Play size={14}/>Run cell</button></div><div onKeyDown={e=>{if(e.shiftKey&&e.key==='Enter'){e.preventDefault();if(!busy)runCell(cell.id)}}}><CodeEditor key={cell.id+'-'+i} language="python" label={'Python cell '+(i+1)} value={cell.source} disabled={busy} onChange={value=>change(cell.id,value)}/></div></div>
 {output&&<div className={'notebook-output '+(output.error?'has-error':'')} aria-label={'Output for cell '+(i+1)}><div className="notebook-output-label">Out [{output.execution}]{stale&&<span>Code or earlier state changed · re-run this cell</span>}</div>{output.outputs.map((o,j)=><Output key={j} output={o}/>)}{output.error&&<pre role="alert">{output.error}</pre>}{!output.outputs.length&&!output.error&&<p>Executed with no output.</p>}{lesson&&!stale&&!output.error&&<p className={output.checkError?'notebook-check-pending':'notebook-check-pass'}>{output.checkError?'Keep going: '+output.checkError:'Lesson checks passed.'}</p>}</div>}
 </article>})}</div>
 <button className="secondary notebook-add" disabled={busy||notebook.cells.length>=20} onClick={()=>setNotebook(p=>({...p,cells:[...p.cells,{id:'scratch-'+crypto.randomUUID(),source:'# Explore the dataset here.\n'}]}))}><Plus size={15}/>Add code cell</button><span className="notebook-shortcut">Shift + Enter runs the focused cell.</span>
 </section>;
}
function Output({output:o}:{output:NotebookOutput}){return o.kind==='file'?<button className="secondary" onClick={()=>{const bytes=Uint8Array.from(atob(o.base64),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'}));const a=document.createElement('a');a.href=url;a.download=o.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}><Download size={15}/>Download {o.name}</button>:o.kind==='table'?<div className="notebook-table"><table><thead><tr>{o.columns.map((c,i)=><th key={i}>{c}</th>)}</tr></thead><tbody>{o.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table><p>{o.total} rows{o.total>o.rows.length?` · showing first ${o.rows.length}`:''}</p></div>:<pre>{o.text}</pre>;}
