'use client';
import {useEffect,useRef,useState} from 'react';
import type {WebWorkerMLCEngine,ChatCompletionMessageParam} from '@mlc-ai/web-llm';
const errorText=(e:unknown)=>e instanceof Error?e.message:typeof e==='string'?e:'The device could not complete the request.';
export const modelId='Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC';
export function useLocalModel(){
 const engine=useRef<WebWorkerMLCEngine|null>(null),worker=useRef<Worker|null>(null),generation=useRef(0),lock=useRef(false);
 const [status,setStatus]=useState('Model not loaded'),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const cancelReply=useRef<(()=>void)|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 function stop(){generation.current++;cancelReply.current?.();cancelReply.current=null;worker.current?.terminate();worker.current=null;engine.current=null;lock.current=false;if(timer.current)clearTimeout(timer.current);setReady(false);setBusy(false);setStatus('Stopped · reload the model to continue');}
 useEffect(()=>()=>{generation.current++;cancelReply.current?.();cancelReply.current=null;worker.current?.terminate();if(timer.current)clearTimeout(timer.current)},[]);
 async function load(){
  if(lock.current||engine.current)return;
  if(!('gpu' in navigator)){setError('This browser does not support WebGPU. Try an updated Chrome or Edge on a computer. You can still edit code and run tests here.');return;}
  const id=++generation.current;lock.current=true;setBusy(true);setError('');setStatus('Preparing local AI…');
  timer.current=setTimeout(()=>{if(generation.current===id){stop();setError('Model download timed out. Check your connection and try again; cached files can be reused.')}},600000);
  try{const {CreateWebWorkerMLCEngine}=await import('@mlc-ai/web-llm');if(id!==generation.current)return;
   const w=new Worker('/interview/ai-worker.js',{type:'module'});worker.current=w;
   const e=await CreateWebWorkerMLCEngine(w,modelId,{initProgressCallback:p=>{if(id===generation.current)setStatus(p.text)},logLevel:'WARN'},{context_window_size:4096});
   if(id!==generation.current){w.terminate();return;}engine.current=e;setReady(true);setStatus('Qwen Coder ready · running on this device');
  }catch(e){if(id===generation.current){worker.current?.terminate();worker.current=null;setError('Could not load local AI. Check WebGPU support, available memory, and access to huggingface.co. '+errorText(e).slice(0,220));setStatus('Model unavailable')}}finally{if(id===generation.current){if(timer.current)clearTimeout(timer.current);lock.current=false;setBusy(false)}}
 }
 async function reply(messages:ChatCompletionMessageParam[],onText:(text:string)=>void){
  if(!engine.current||lock.current)throw Error('Load the model before chatting.');
  const id=generation.current;lock.current=true;setBusy(true);setError('');setStatus('Thinking…');
  timer.current=setTimeout(()=>{if(id===generation.current){stop();setError('Generation timed out. Try a shorter message after reloading.')}},120000);
  const cancelled=new Promise<boolean>(resolve=>{cancelReply.current=()=>resolve(false)});
  const generate=async()=>{try{const stream=await engine.current!.chat.completions.create({messages,stream:true,max_tokens:350,temperature:0.2});let text='',limited=false;for await(const chunk of stream){if(id!==generation.current)return false;text+=chunk.choices[0]?.delta.content||'';if(chunk.choices[0]?.finish_reason==='length')limited=true;onText(text.slice(0,3000));}if(limited)onText(text.slice(0,2900)+'\n[Reply reached its length limit. Ask for a shorter explanation or a specific follow-up.]');if(!text.trim())throw Error('The model returned no text. Try again.');return id===generation.current;}
  catch(e){if(id===generation.current)setError('Reply failed: '+errorText(e).slice(0,220));return false;}
  finally{if(id===generation.current){if(timer.current)clearTimeout(timer.current);lock.current=false;setBusy(false);setStatus('Qwen Coder ready · running on this device')}}};
  try{return await Promise.race([generate(),cancelled]);}finally{if(id===generation.current)cancelReply.current=null;}
 }
 return {status,ready,busy,error,load,reply,stop};
}
