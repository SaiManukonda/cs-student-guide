'use client';
import {useState} from 'react';
import {Copy,Check} from 'lucide-react';
export function Snippet({label,children}:{label:string;children:string}){const [copied,setCopied]=useState(false),[failed,setFailed]=useState(false);return <div className="course-snippet"><div><span>{label}</span><button className="text-link" aria-label={'Copy '+label} onClick={async()=>{try{await navigator.clipboard.writeText(children);setCopied(true);setFailed(false);setTimeout(()=>setCopied(false),1800)}catch{setFailed(true)}}}>{copied?<Check size={14}/>:<Copy size={14}/>}<span>{copied?'Copied':'Copy'}</span></button></div><pre><code>{children}</code></pre>{failed&&<span role="status">Select the text to copy it manually.</span>}</div>}
export function Checkpoint({question,children}:{question:string;children:React.ReactNode}){return <div className="course-check"><h3>Check your understanding</h3><p>{question}</p><details><summary>Show answer</summary><p>{children}</p></details></div>}
