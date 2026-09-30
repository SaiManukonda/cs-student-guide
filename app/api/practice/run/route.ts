import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/db/storage';
import {problems,type Language} from '@/app/practice-data/catalog';
import {buildProgram,compiler,grade,marker} from '@/app/practice-data/engine';
import {z} from 'zod';
export const dynamic='force-dynamic';
const schema=z.object({problem:z.string().max(100),language:z.enum(['javascript','python','java','cpp']),code:z.string().min(1).max(20000),submit:z.boolean()});
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
async function boundedText(response:Response){const reader=response.body?.getReader();if(!reader)return '';const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>256000){await reader.cancel();throw new Error('Program output exceeded the limit. Remove large debug prints.');}chunks.push(value);}const all=new Uint8Array(size);let at=0;for(const chunk of chunks){all.set(chunk,at);at+=chunk.length;}return new TextDecoder().decode(all);}
export async function POST(req:Request){
 const user=await getChatGPTUser();
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Invalid request origin.'},403);
 try{
  if(Number(req.headers.get('content-length')||0)>30000)return reply({error:'Code is too large.'},413);
  const raw=await req.text();if(raw.length>30000)return reply({error:'Code is too large.'},413);
  let json:unknown;try{json=JSON.parse(raw);}catch{return reply({error:'Invalid request.'},400);}
  const parsed=schema.safeParse(json);if(!parsed.success)return reply({error:'Choose a problem, language, and solution.'},400);
  const {problem:id,language,code,submit}=parsed.data;const p=problems.find(p=>p.id===id);if(!p)return reply({error:'Unknown problem.'},404);
  // Persistent limits for accounts or anonymous networks across Worker instances.
  const now=Date.now(),day=new Date().toISOString().slice(0,10);
  const network=req.headers.get('cf-connecting-ip')||'shared-guest';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(day+':'+network));
  const limitKey=user?.userId||'guest:'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const allowed=await database().prepare(`INSERT INTO practice_limits(user_id,day,runs,next_at) VALUES(?,?,1,?) ON CONFLICT(user_id) DO UPDATE SET day=excluded.day,runs=CASE WHEN practice_limits.day=excluded.day THEN practice_limits.runs+1 ELSE 1 END,next_at=excluded.next_at WHERE practice_limits.next_at<=? AND (practice_limits.day!=excluded.day OR practice_limits.runs<200) RETURNING runs`).bind(limitKey,day,now+5000,now).first();
  if(!allowed)return reply({error:'Please wait 5 seconds between runs. Up to 200 runs per UTC day per account or guest network.'},429);
  // Only code and the test harness leave the app. Never send identity or workspace data.
  const response=await fetch('https://wandbox.org/api/compile.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({compiler:compiler[language as Language],code:buildProgram(p,language,code,submit),options:language==='cpp'?'warning,c++17':'',save:false}),signal:AbortSignal.timeout(45000)});
  if(!response.ok)return reply({error:response.status===429?'The compiler service is busy. Please retry shortly.':'The compiler service is temporarily unavailable. Your code is still in the editor.'},503);
  const result=JSON.parse(await boundedText(response));
  const stdout=String(result.program_output||'');
  if(!stdout.includes(marker)){
   const message=String(result.compiler_error||result.compiler_message||result.program_error||result.program_message||result.signal||'The program stopped without returning a result.');
   return reply({error:message.slice(0,6000)},422);
  }
  return reply({...grade(p,submit,stdout),diagnostics:String(result.program_error||result.compiler_error||'').slice(0,3000)});
 }catch(e){const message=e instanceof Error?e.message:'';if(message.includes('output exceeded'))return reply({error:message},422);if(e instanceof Error&&['TimeoutError','AbortError'].includes(e.name))return reply({error:'Execution timed out. Check for an infinite loop, then retry.'},504);console.error('Practice execution failed',e instanceof Error?e.name:'unknown');return reply({error:'The runner could not complete this request. Your code is still in the editor; please retry.'},503);}
}
