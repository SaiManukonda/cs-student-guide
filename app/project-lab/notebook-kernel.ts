'use client';
import {useEffect,useRef,useState} from 'react';
import type {NotebookOutput} from './notebook-course';
export type CellRun={outputs:NotebookOutput[];error:string|null;checkError:string|null;execution:number;source:string;invalidated?:boolean};
export function useNotebookKernel(packages:string[]){
 const worker=useRef<Worker|null>(null),pending=useRef<{id:string;resolve:(v:CellRun)=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}|null>(null);
 const [status,setStatus]=useState('Python not started'),[busy,setBusy]=useState(false);
 const loaded=useRef(false);
 function stop(message='Kernel restarted · variables cleared'){
  worker.current?.terminate();worker.current=null;loaded.current=false;
  if(pending.current){clearTimeout(pending.current.timer);pending.current.reject(new Error('Execution stopped. Run all to rebuild the notebook state.'));pending.current=null;}
  setBusy(false);setStatus(message);
 }
 useEffect(()=>()=>{worker.current?.terminate();if(pending.current){clearTimeout(pending.current.timer);pending.current.reject(new Error('Notebook closed.'));pending.current=null;}},[]);
 async function execute(source:string,check:string):Promise<CellRun>{
  if(pending.current)throw new Error('Another cell is running.');
  setBusy(true);
  if(!worker.current){
   setStatus('Loading Python…');
   worker.current=new Worker('/notebook/worker.js',{type:'module'});
   worker.current.onmessage=({data})=>{
    if(data.type==='status'){setStatus(data.message);return;}
    if(data.type==='ready'){loaded.current=true;setStatus('Running cell…');if(pending.current){clearTimeout(pending.current.timer);pending.current.timer=setTimeout(()=>stop('Cell timed out · kernel stopped'),30000);}return;}
    const active=pending.current;if(!active||data.id!==active.id)return;
    clearTimeout(active.timer);pending.current=null;setBusy(false);
    if(data.type==='result'){setStatus('Python ready');active.resolve(data);}
    else {setStatus('Python unavailable · try again');worker.current?.terminate();worker.current=null;loaded.current=false;active.reject(new Error(data.message||'Python could not start. Check your connection and try again.'));}
   };
   worker.current.onerror=()=>stop('Python could not load · check your connection and retry');
  }else setStatus('Running cell…');
  return new Promise<CellRun>((resolve,reject)=>{
   const id=crypto.randomUUID();pending.current={id,resolve,reject,timer:setTimeout(()=>stop(loaded.current?'Cell timed out · kernel stopped':'Python download timed out · check your connection and retry'),loaded.current?30000:120000)};
   worker.current!.postMessage({type:'run',id,source,check,packages});
  });
 }
 return {status,busy,execute,stop};
}
