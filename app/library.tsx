'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,ArrowRight,Bookmark,Check,Download,Search,GraduationCap,Layers3,RefreshCw} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Checkbox} from '@/components/ui/checkbox';
import {Progress} from '@/components/ui/progress';
import {Skeleton} from '@/components/ui/skeleton';
import {Empty,EmptyHeader,EmptyTitle,EmptyDescription} from '@/components/ui/empty';
import {Table,TableHeader,TableHead,TableBody,TableRow,TableCell} from '@/components/ui/table';
import {Picker,OutLink,type SavedState} from './workspace';
import CoursePlanner from './course-planner';
import CampusPlanner from './campus-planner';
import {universities,isUniversity} from './university';
import {type CampusId} from './campus-programs';
import {TutorialLibrary,Clubs} from './learning';
import ResumeStudio from './resume-studio';
import Practice from './practice';
import AiCourse from './ai-course';
import GitCourse from './git-course';
type Props={section:string;state:SavedState;save:(s:SavedState)=>Promise<boolean>;add:(a?:{company:string;role:string;url:string})=>void;saving:boolean};
type Job={id:string;company:string;role:string;url:string;locations:string[];category:string;terms:string[];posted:number};
export default function Library(props:Props){const {section,state,save,saving}=props;
 if(section==='opportunities')return <Opportunities {...props}/>;
 if(section==='practice')return <Practice state={state} save={save} saving={saving}/>;
 if(section==='resumes')return <ResumeStudio state={state} save={save} saving={saving}/>;
 if(section==='clubs')return <Clubs college={state.college}/>;
 if(section==='ai-literacy')return <AiCourse/>;
 if(section==='git-literacy')return <GitCourse/>;
 if(section==='projects')return <TutorialLibrary kind={section} state={state} save={save} saving={saving}/>;
 if(section==='courses'&&isUniversity(state.college)){const id=universities[state.college].id;return id==='rutgers'?<CoursePlanner key={id} state={state} save={save} saving={saving}/>:<CampusPlanner key={id} id={id as CampusId} state={state} save={save} saving={saving}/>;}
 return null;
}
function Opportunities({state,add}:Props){const [jobs,setJobs]=useState<Job[]>([]),[query,setQuery]=useState(''),[category,setCategory]=useState('All roles'),[loading,setLoading]=useState(true),[error,setError]=useState(''),[updated,setUpdated]=useState(''),[page,setPage]=useState(1);async function load(){setLoading(true);setError('');try{const r=await fetch('/api/opportunities');const d=await r.json() as {error?:string;jobs:Job[];fetchedAt:string};if(!r.ok)throw Error(d.error);setJobs(d.jobs);setUpdated(d.fetchedAt)}catch(e){setError((e as Error).message||'Could not load opportunities.')}finally{setLoading(false)}}useEffect(()=>{load()},[]);const filtered=jobs.filter(j=>(category==='All roles'||j.category===category)&&`${j.company} ${j.role} ${j.locations.join(' ')}`.toLowerCase().includes(query.toLowerCase()));return <><div className="toolbar"><div className="search wide-search"><Search size={17}/><input aria-label="Search opportunities" placeholder="Search company, role, or location..." value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></div><Picker label="Role category" value={category} onChange={v=>{setCategory(v);setPage(1)}} options={['All roles',...new Set(jobs.map(j=>j.category))]}/><button className="icon-button" aria-label="Refresh opportunities" disabled={loading} onClick={load}><RefreshCw size={17}/></button></div><div className="result-meta"><span>{loading?'Fetching current listings…':`${filtered.length} opportunities`}</span>{updated&&<span>Fetched {new Date(updated).toLocaleString()}</span>}</div>{error?<div className="notice" role="alert">{error} <button onClick={load}>Try again</button></div>:loading?<div className="loading-rows"><Skeleton className="h-24"/><Skeleton className="h-24"/><Skeleton className="h-24"/></div>:<div className="job-list">{filtered.slice((page-1)*20,page*20).map(j=>{const tracked=state.applications.some(a=>a.url===j.url);return <article className="job-row" key={j.id}><span className="company-icon">{j.company.slice(0,2).toUpperCase()}</span><div className="job-info"><span className="job-company">{j.company}</span><h3>{j.role}</h3><p>{j.locations.join(' · ')}<span className="job-divider">/</span>{j.terms.join(', ')}</p><span className="tag">{j.category}</span></div><div className="job-actions"><OutLink href={j.url}>Apply</OutLink><button disabled={tracked} className="secondary" onClick={()=>add({company:j.company,role:j.role,url:j.url})}>{tracked?<Check size={15}/>:<Bookmark size={15}/>} {tracked?'Tracked':'Track'}</button></div></article>})}{!filtered.length&&<Empty><EmptyHeader><EmptyTitle>No matching roles</EmptyTitle><EmptyDescription>Try a broader search or a different role category.</EmptyDescription></EmptyHeader></Empty>}</div>}{filtered.length>20&&<div className="pagination"><button className="secondary" disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length/20)}</span><button className="secondary" disabled={page>=Math.ceil(filtered.length/20)} onClick={()=>setPage(page+1)}>Next</button></div>}<p className="source-note"><OutLink href="https://github.com/SimplifyJobs/Summer2027-Internships">Source: Simplify & Pitt CSC</OutLink> · Confirm availability on the employer’s website.</p></>}
