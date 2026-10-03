'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,Square,FileCode2,FolderOpen,Check,Download} from 'lucide-react';
import CodeEditor from '../code-editor';
import NotebookLab from './notebook';
import {ciCourse} from './ci-course';
import {mlCourse} from './ml-course';
import {notebookLessons,notebookId} from './notebook-course';
import {OutLink,type SavedState} from '../workspace';
import {projectLabSchema} from '../workspace-schema';
import {buildPreview,type CheckResult} from './preview';
import {checkpoint,fileNames,freshLab,lessons,projectId,type ProjectFile,type LabProgress} from './course';

type Props={state:SavedState;save:(s:SavedState)=>Promise<boolean>;saving:boolean};
export default function ProjectLab(props:Props){
 const [selected,setSelected]=useState<'taskboard'|'notebook'|'ml'|'ci'|null>(null);
 if(selected==='taskboard')return <Lab {...props} onBack={()=>setSelected(null)}/>;
 if(selected==='ci')return <NotebookLab {...props} course={ciCourse} onBack={()=>setSelected(null)}/>;
 if(selected==='ml')return <NotebookLab {...props} course={mlCourse} onBack={()=>setSelected(null)}/>;
 if(selected==='notebook')return <NotebookLab {...props} onBack={()=>setSelected(null)}/>;
 const task=props.state.projectLabs?.[projectId],notebook=props.state.notebooks?.[notebookId],ml=props.state.notebooks?.[mlCourse.id],ci=props.state.notebooks?.[ciCourse.id];
 return <section className="project-directory" aria-label="Available projects">
 <p className="project-directory-intro">Choose a project. Learn by building, run your code, and save your progress.</p>
 <article><div className="project-directory-meta"><span>01 · Web development</span><span>Beginner · 7 lessons</span></div><h2>Taskboard</h2><p>Build a task tracker from scratch. Create, read, update and delete tasks, then keep them in browser storage.</p><div className="project-directory-footer"><span>HTML · CSS · JavaScript</span><span>{task?.completed.length||0} / 7 complete</span><button className="primary" onClick={()=>setSelected('taskboard')}>{task?'Continue Taskboard':'Open Taskboard'}</button></div></article>
 <article><div className="project-directory-meta"><span>02 · Data analysis</span><span>Beginner · 6 lessons</span></div><h2>Campus café sales</h2><p>Clean a sales dataset, calculate revenue with NumPy, and build a pandas report in a runnable Python notebook.</p><div className="project-directory-footer"><span>Python · pandas · NumPy</span><span>{notebook?.completed.length||0} / {notebookLessons.length} complete</span><button className="primary" onClick={()=>setSelected('notebook')}>{notebook?'Continue sales notebook':'Open sales notebook'}</button></div></article>
 <article><div className="project-directory-meta"><span>03 · Machine learning</span><span>Beginner · 6 lessons</span></div><h2>Your first classifier</h2><p>Train a flower classifier with scikit-learn. Split your data, compare a baseline, evaluate mistakes, and predict new examples.</p><div className="project-directory-footer"><span>{mlCourse.stack}</span><span>{ml?.completed.length||0} / 6 complete</span><button className="primary" onClick={()=>setSelected('ml')}>{ml?'Continue classifier':'Open classifier'}</button></div></article>
 <article><div className="project-directory-meta"><span>04 · CI/CD</span><span>Beginner · 6 lessons</span></div><h2>From tests to deployment</h2><p>Test a small site, catch a regression, build an artifact, and prepare a GitHub Actions deployment. Export the repository to run it on GitHub.</p><div className="project-directory-footer"><span>{ciCourse.stack}</span><span>{ci?.completed.length||0} / 6 complete</span><button className="primary" onClick={()=>setSelected('ci')}>{ci?'Continue CI/CD project':'Open CI/CD project'}</button></div></article>
 </section>;
}
function Lab({state,save,saving,onBack}:Props&{onBack:()=>void}){
 const [lab,setLab]=useState<LabProgress>(()=>state.projectLabs?.[projectId]||freshLab());
 const [saved,setSaved]=useState(()=>JSON.stringify(state.projectLabs?.[projectId]||freshLab()));
 const [file,setFile]=useState<ProjectFile>(()=>lessons[(state.projectLabs?.[projectId]||freshLab()).lesson].file),[panel,setPanel]=useState('Editor');
 const [run,setRun]=useState<{html:string;token:string;files:string}|null>(null),[test,setTest]=useState<{html:string;token:string;lesson:number;files:string}|null>(null);
 const [status,setStatus]=useState('Not running'),[logs,setLogs]=useState<string[]>([]),[results,setResults]=useState<CheckResult[]|null>(null),[replace,setReplace]=useState<'starter'|'solution'|null>(null),[hint,setHint]=useState(false),[solution,setSolution]=useState(false),[saveError,setSaveError]=useState('');
 const frame=useRef<HTMLIFrameElement>(null),testFrame=useRef<HTMLIFrameElement>(null),current=useRef(lab);current.current=lab;
 const lesson=lessons[lab.lesson],dirty=JSON.stringify(lab)!==saved,stale=!!run&&run.files!==JSON.stringify(lab.files);
 const update=(patch:Partial<LabProgress>)=>setLab(p=>({...p,...patch}));
 useEffect(()=>{
  const leave=(e:BeforeUnloadEvent)=>{if(JSON.stringify(current.current)!==saved){e.preventDefault();e.returnValue='';}};
  const navigate=(e:MouseEvent)=>{const a=(e.target as HTMLElement).closest('a');if(a&&a.target!=='_blank'&&!a.hasAttribute('download')&&JSON.stringify(current.current)!==saved&&!window.confirm('You have unsaved project changes. Leave without saving?'))e.preventDefault();};
  addEventListener('beforeunload',leave);document.addEventListener('click',navigate,true);
  return()=>{removeEventListener('beforeunload',leave);document.removeEventListener('click',navigate,true)};
 },[saved]);
 useEffect(()=>{
  const receive=(e:MessageEvent)=>{
   const d=e.data;if(!d||d.channel!=='compsciguide-project')return;
   const fromRun=e.source===frame.current?.contentWindow&&d.token===run?.token;
   const fromTest=e.source===testFrame.current?.contentWindow&&d.token===test?.token;
   if(!fromRun&&!fromTest)return;
   if(d.type==='error'||d.type==='console'){
    if(typeof d.payload!=='string')return;
    setLogs(p=>[...p,d.payload.slice(0,1500)].slice(-100));if(d.type==='error'&&fromRun)setStatus('Error — see console');
   }
   if(fromRun&&d.type==='ready')setStatus(s=>s.startsWith('Error')?s:'Running');
   if(fromRun&&d.type==='storage'){
    const valid=projectLabSchema.shape.storage.safeParse(d.payload);if(valid.success)setLab(p=>({...p,storage:valid.data}));
   }
   if(fromTest&&d.type==='checks'&&Array.isArray(d.payload)&&d.payload.length<=15&&d.payload.every((r:CheckResult)=>typeof r.label==='string'&&typeof r.passed==='boolean'&&typeof r.detail==='string')){
    const unchanged=test!.files===JSON.stringify(current.current.files);
    const checked=d.payload as CheckResult[];setResults(unchanged?checked:[{label:'Code changed during checks',passed:false,detail:'Run checks again against your latest code.'}]);
    if(unchanged&&checked.length&&checked.every(r=>r.passed))setLab(p=>({...p,completed:[...new Set([...p.completed,...Array.from({length:test!.lesson+1},(_,i)=>i)])].sort()}));
    setTest(null);
   }
  };
  addEventListener('message',receive);return()=>removeEventListener('message',receive);
 },[run,test]);
 useEffect(()=>{if(!test)return;const id=setTimeout(()=>{setResults([{label:'Check timed out',passed:false,detail:'Look for an endless loop or a script error, then try again.'}]);setTest(null)},8000);return()=>clearTimeout(id)},[test]);
 function start(){const token=crypto.randomUUID();setLogs([]);setStatus('Starting…');setRun({token,files:JSON.stringify(lab.files),html:buildPreview(lab.files,{token,lesson:lab.lesson,check:false,storage:lab.storage})});setPanel('Preview');}
 function check(){const token=crypto.randomUUID();setResults(null);setLogs([]);const storage:Record<string,string>=lab.lesson===6?{taskboard:JSON.stringify([{id:'check-first',title:'Check fixture',done:false},{id:'check-saved',title:'Previously saved task',done:false}])}:{};setTest({token,lesson:lab.lesson,files:JSON.stringify(lab.files),html:buildPreview(lab.files,{token,lesson:lab.lesson,check:true,storage})});}
 async function persist(){const snapshot=lab;setSaveError('');if(await save({...state,projectLabs:{...state.projectLabs,[projectId]:snapshot}})){setSaved(JSON.stringify(snapshot));return true;}setSaveError('Progress was not saved. Your code is still here; try Save progress again.');return false;}
 function chooseLesson(index:number){update({lesson:index});setFile(lessons[index].file);setHint(false);setSolution(false);setResults(null);setTest(null);setReplace(null);}
 function applyCheckpoint(){update({files:checkpoint(replace==='solution'?lab.lesson:lab.lesson-1)});setReplace(null);setResults(null);setTest(null);setPanel('Editor');}
 function download(){const blob=new Blob([lab.files[file]],{type:file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className="project-lab" aria-label="Guided project workspace">
 <button className="text-link project-back" disabled={saving} onClick={async()=>{if(!dirty||await persist())onBack()}}>Back to project library</button>
 <div className="lab-toolbar"><div><strong>Taskboard</strong><span>Frontend CRUD · 7 lessons</span></div><span className="lab-save-state" role="status">{dirty?'Unsaved changes':'Progress saved'}</span><button className="secondary" disabled={saving||!dirty} onClick={persist}>{saving?'Saving…':'Save progress'}</button><button className="primary" onClick={start}><Play size={15}/>Run</button><button className="secondary" disabled={!run} onClick={()=>{setRun(null);setStatus('Stopped')}}><Square size={14}/>Stop</button></div>
 {saveError&&<p className="notice" role="alert">{saveError}</p>}
 <div className="lab-layout">
 <aside className="lab-lessons"><div className="lab-section-title"><strong>Course</strong><span>{lab.completed.length} / 7</span></div><progress aria-label="Project course progress" max="7" value={lab.completed.length}/><nav aria-label="Project lessons">{lessons.map((l,i)=><button key={l.title} className={i===lab.lesson?'active':''} aria-current={i===lab.lesson?'step':undefined} onClick={()=>chooseLesson(i)}><span>{lab.completed.includes(i)?<Check size={15}/>:String(i+1).padStart(2,'0')}</span>{l.title}</button>)}</nav><p>Completed checks track milestones. You can revisit any lesson.</p><div className="lab-section-title"><strong>Files</strong></div><nav aria-label="File explorer">{fileNames.map(f=><button key={f} className={f===file?'active':''} aria-label={'Open '+f} onClick={()=>{setFile(f);setPanel('Editor')}}><FileCode2 size={15}/>{f}</button>)}</nav></aside>
 <article className="lab-lesson"><div className="lab-section-title"><span>LESSON {lab.lesson+1}</span><code>{lesson.file}</code></div><h2>{lesson.title}</h2><p className="lab-goal">{lesson.goal}</p>{lesson.explain.map(p=><p key={p}>{p}</p>)}<h3>Your turn</h3><ol>{lesson.steps.map(p=><li key={p}>{p}</li>)}</ol>
 <button className="text-link" aria-expanded={hint} onClick={()=>setHint(!hint)}>{hint?'Hide hint':'Need a hint?'}</button>{hint&&<p className="lab-hint">{lesson.hint}</p>}
 <div className="lab-lesson-actions"><button className="secondary" disabled={!!test} onClick={check}>{test?'Checking…':'Check my work'}</button><button className="text-link" onClick={()=>setReplace('starter')}>Load lesson starter</button></div><p className="lab-check-description">{lesson.verify}</p>
 {results&&<ul className="lab-checks" aria-label="Lesson check results" aria-live="polite">{results.map((r,i)=><li key={i} className={r.passed?'passed':'failed'}><strong>{r.passed?'✓':'×'} {r.label}</strong>{r.detail&&<span>{r.detail}</span>}</li>)}</ul>}
 {results?.every(r=>r.passed)&&<p className="lab-success">{lab.lesson===6?'Course complete. Save your work, then try adding filters or due dates.':'Checks passed. Save your progress or continue to the next lesson.'}</p>}
 <div className="lab-solution"><button className="text-link" aria-expanded={solution} onClick={()=>setSolution(!solution)}>{solution?'Hide reference':'Show reference solution'}</button>{solution&&<><pre><code>{lesson.snippet}</code></pre><button className="secondary" onClick={()=>setReplace('solution')}>Load completed checkpoint</button></>}</div>
 {replace&&<div className="lab-confirm" role="alert"><p>Replace all three editor files with {replace==='starter'?'this lesson’s starting code':'the completed code through this lesson'}? Your current code will be replaced. Saved task data stays.</p><button className="secondary" onClick={applyCheckpoint}>Replace files</button><button className="text-link" onClick={()=>setReplace(null)}>Cancel</button></div>}
 <div className="lab-pagination"><button className="secondary" disabled={lab.lesson===0} onClick={()=>chooseLesson(lab.lesson-1)}>Previous</button><button className="secondary" disabled={lab.lesson===6} onClick={()=>chooseLesson(lab.lesson+1)}>Next lesson</button></div><OutLink href={lesson.source}>Reference documentation</OutLink>
 </article>
 <div className="lab-workbench"><div className="lab-view-tabs" role="group" aria-label="Workspace panels">{['Editor','Preview'].map(p=><button key={p} aria-pressed={panel===p} onClick={()=>setPanel(p)}>{p}</button>)}</div>
 <section className={'lab-code '+(panel==='Editor'?'panel-active':'')} aria-label="Project files"><div className="lab-section-title"><span><FolderOpen size={15}/>taskboard /</span><button className="text-link" onClick={download}><Download size={14}/>Download file</button></div><div className="lab-file-tabs" role="group" aria-label="Repository files">{fileNames.map(f=><button key={f} aria-pressed={f===file} onClick={()=>setFile(f)}><FileCode2 size={14}/>{f}</button>)}</div><CodeEditor key={file} value={lab.files[file]} language={file==='app.js'?'javascript':file==='index.html'?'html':'css'} onChange={value=>setLab(p=>p.files[file]===value?p:{...p,files:{...p.files,[file]:value}})}/><div className="lab-file-help">{file} · {lab.files[file].length.toLocaleString()} / 20,000 characters</div></section>
 <section className={'lab-preview '+(panel==='Preview'?'panel-active':'')} aria-label="Browser preview"><div className="lab-section-title"><strong>Browser preview</strong><span aria-live="polite">{stale?'Code changed · Run to update':status}</span></div>{run?<iframe key={run.token} ref={frame} title="Taskboard browser preview" sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" srcDoc={run.html}/>:<div className="lab-preview-empty"><strong>Run your code</strong><p>Your HTML, CSS and JavaScript run here. No installation needed.</p><button className="secondary" onClick={start}><Play size={15}/>Run project</button></div>}<details className="lab-console" open={logs.length>0}><summary>Console{logs.length?' · '+logs.length:''}</summary><pre aria-live="polite">{logs.length?logs.join('\n'):'No output. Use console.log() in app.js to inspect values.'}</pre></details></section>
 <p className="lab-runtime-note">Runs HTML, CSS and plain JavaScript in an isolated preview. No npm packages or backend. Checks use separate sample data.</p>
 </div></div>
 {test&&<iframe className="lab-test-frame" ref={testFrame} key={test.token} title="Automated lesson checks" sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" srcDoc={test.html} aria-hidden="true" tabIndex={-1}/>}
 </section>;
}
