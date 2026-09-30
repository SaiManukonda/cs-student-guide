export const dynamic='force-dynamic';
const feeds=[
 {type:'Internship',url:'https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/dev/.github/scripts/listings.json'},
 {type:'Full-time',url:'https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json'},
];
type Listing={id:string;active:boolean;is_visible:boolean;company_name:string;title:string;url:string;locations?:string[];category?:string;terms?:string[];date_posted?:number};
let cache:{jobs:unknown[];fetchedAt:string}|null=null;
export async function GET(){
 if(cache&&Date.now()-Date.parse(cache.fetchedAt)<15*60*1000)return Response.json(cache);
 const results=await Promise.allSettled(feeds.map(async feed=>{
  const r=await fetch(feed.url,{signal:AbortSignal.timeout(25000)});
  if(!r.ok)throw Error('Source unavailable');
  const listings=await r.json() as Listing[];
  if(!Array.isArray(listings))throw Error('Unexpected source format');
  return listings.filter(j=>j.active===true&&j.is_visible===true&&typeof j.url==='string'&&/^https?:\/\//.test(j.url)&&typeof j.company_name==='string'&&typeof j.title==='string')
   .map(j=>({id:`${feed.type}:${j.id}`,company:j.company_name,role:j.title,url:j.url,locations:j.locations||[],category:j.category||'Other',terms:j.terms||[],posted:j.date_posted||0,employmentType:feed.type}));
 }));
 const jobs=results.flatMap(r=>r.status==='fulfilled'?r.value:[]).sort((a,b)=>b.posted-a.posted);
 const failed=results.flatMap((r,i)=>r.status==='rejected'?[feeds[i].type]:[]);
 if(failed.length===feeds.length)return Response.json({error:'Job sources are unavailable. Please retry.'},{status:503});
 const response={jobs,fetchedAt:new Date().toISOString()};
 if(failed.length)return Response.json({...response,warning:`${failed.join(' and ')} listings are temporarily unavailable. Refresh to retry.`});
 cache=response;
 return Response.json(response);
}
