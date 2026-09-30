'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
const key='compsciguide:theme';
export default function ThemeToggle(){
 const [dark,setDark]=useState(false);
 useEffect(()=>{
  const update=()=>setDark(document.documentElement.classList.contains('dark'));
  update();
  const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const system=()=>{try{if(localStorage.getItem(key))return}catch{}document.documentElement.classList.toggle('dark',media.matches)};
  const sync=(event:StorageEvent)=>{if(event.key===key)document.documentElement.classList.toggle('dark',event.newValue?event.newValue==='dark':media.matches)};
  media.addEventListener('change',system);window.addEventListener('storage',sync);
  return()=>{observer.disconnect();media.removeEventListener('change',system);window.removeEventListener('storage',sync)};
 },[]);
 function toggle(){const next=!document.documentElement.classList.contains('dark');document.documentElement.classList.toggle('dark',next);setDark(next);try{localStorage.setItem(key,next?'dark':'light')}catch{}}
 return <button type="button" className="theme-toggle" onClick={toggle} aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Switch to light mode':'Switch to dark mode'}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>;
}
