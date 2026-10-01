import {michiganAudit} from './umich-audit';
import {campusCourses,programs,type CampusId} from './campus-programs';
import {campusCourseKey,type CampusPlan} from './campus-plan';
import {uiucFocus,uiucTeam,vtCore,vtTheory,vtCapstone,vtExcluded} from './campus-audit-data';
import {threadRules} from './thread-rules';
export type AuditRow={id:string;label:string;completed:string[];options:string[];earned:number;required:number;unit:string;complete:boolean;detail:string;alternatives?:string[][]};
export type CampusAudit={rows:AuditRow[];percent:number;complete:number;total:number;notes:string[]};
const unique=(xs:string[])=>[...new Set(xs)];
const makeRow=(id:string,label:string,completed:string[],options:string[],earned:number,required:number,detail='',unit='courses'):AuditRow=>({id,label,completed:unique(completed),options:unique(options),earned:Math.min(required,earned),required,unit,complete:earned>=required,detail});

/** Maximum bipartite matching, rather than greedy allocation, keeps a flexible
 * elective from stealing the only course that can satisfy a narrower slot. */
export function assignSlots(groups:{options:string[];count:number}[],done:Set<string>){
 const slots=groups.flatMap((g,i)=>Array.from({length:g.count},()=>({group:i,options:g.options.filter(c=>done.has(c))}))),owner=new Map<string,number>();
 function match(i:number,seen:Set<string>):boolean{
  for(const code of slots[i].options){if(seen.has(code))continue;seen.add(code);const old=owner.get(code);if(old===undefined||match(old,seen)){owner.set(code,i);return true}}
  return false;
 }
 slots.forEach((_,i)=>match(i,new Set()));
 return groups.map((_,i)=>[...owner].filter(([,slot])=>slots[slot].group===i).map(([code])=>code));
}
export function campusAudit(id:CampusId,completed:string[],plan:CampusPlan):CampusAudit{
 if(id==='umich')return michiganAudit(completed,plan);
 const courses=campusCourses(id),byCode=new Map(courses.map(c=>[c.code,c])),done=new Set(courses.filter(c=>completed.includes(campusCourseKey(id,c.code))).map(c=>c.code));
 const credits=(code:string)=>plan.creditOverrides[code]??byCode.get(code)?.credits??0;
 // A zero-credit override means duplicate/ineligible credit, except genuine 0-hour courses.
 const eligible=new Set([...done].filter(c=>plan.creditOverrides[c]!==0&&(credits(c)>0||byCode.get(c)?.credits===null)));
 const rows:AuditRow[]=[],notes:string[]=[];
 const core=id==='vt'?vtCore.map(c=>[c]):programs[id].core;
 if(id!=='gatech')for(const [i,options] of core.entries()){
  const found=options.filter(c=>eligible.has(c)).slice(0,1);
  rows.push(makeRow('core-'+i,options.join(' or '),found,options,found.length,1,byCode.get(options[0])?.title||''));
 }
 const usedCore=new Set(core.flat());
 if(id==='umd'){
  // 460 and 466 are equivalent; each course (including 471) is assigned once.
  const pool=courses.filter(c=>eligible.has(c.code)&&/^Area/.test(c.category)&&!c.code.startsWith('CMSC 498')&&!(c.code==='CMSC 466'&&eligible.has('CMSC 460')));
  type Distribution={counts:number[];selected:string[]};
  let states=new Map<string,Distribution>([['0,0,0,0,0',{counts:[0,0,0,0,0],selected:[]}]]);
  for(const c of pool){const next=new Map(states);for(const value of states.values()){
   if(value.selected.length>=5)continue;
   for(const a of unique([...c.category.matchAll(/Area (\d)/g)].map(m=>m[1])).map(Number)){
    if(value.counts[a-1]>=3)continue;
    const counts=[...value.counts];counts[a-1]++;const selected=[...value.selected,c.code],key=counts.join(',');
    const old=next.get(key);if(!old||selected.reduce((s,c)=>s+credits(c),0)<old.selected.reduce((s,c)=>s+credits(c),0))next.set(key,{counts,selected});
   }
  }states=next}
  const score=(s:Distribution)=>Math.min(5,s.selected.length)+Math.min(3,s.counts.filter(Boolean).length);
  const best=[...states.values()].sort((a,b)=>score(b)-score(a)||b.counts.filter(Boolean).length-a.counts.filter(Boolean).length)[0];
  const areaCount=best.counts.filter(Boolean).length;
  const areaOptions=courses.filter(c=>/^Area/.test(c.category)&&!c.code.startsWith('CMSC 498')).map(c=>c.code);
  const row=makeRow('distribution','Upper-level distribution',best.selected,areaOptions,Math.min(best.selected.length,areaCount<3?4:5),5,`${areaCount} / 3 areas covered. At most 3 courses per area; CMSC 471 counts in one area.`);
  row.complete=best.selected.length===5&&areaCount>=3;rows.push(row);
  const electives=courses.filter(c=>!usedCore.has(c.code)&&!c.code.startsWith('CMSC 498')&&c.code!=='CMSC 499A'&&c.code!=='CMSC 466'&&c.credits!==1).map(c=>c.code);
  if(!eligible.has('CMSC 460'))electives.push('CMSC 466');
  const available=unique(electives).filter(c=>eligible.has(c)&&!best.selected.includes(c));
  const electiveCredits=available.reduce((s,c)=>s+credits(c),0);
  const er=makeRow('electives','Additional CS electives',available,electives,electiveCredits,6,'Two additional courses, separate from the five distribution courses.','credits');
  er.complete=electiveCredits>=6&&available.length>=2;rows.push(er);
  notes.push('Math/statistics electives, the outside-CS concentration, general education and residency still need transcript review.','Semester-specific CMSC 498 topics, research and STIC combinations need approval; they are not automatically assigned.');
 }
 if(id==='uiuc'){
  const options=courses.filter(c=>(c.code==='CS 397'||/^CS 4\d\d$/.test(c.code))&&!['CS 400','CS 401','CS 402','CS 403','CS 421','CS 491'].includes(c.code)).map(c=>c.code);
  const available=options.filter(c=>eligible.has(c));
  const research=available.filter(c=>['CS 397','CS 499'].includes(c));
  const hours=available.filter(c=>!research.includes(c)).reduce((s,c)=>s+credits(c),0)+Math.min(6,research.reduce((s,c)=>s+credits(c),0));
  const tech=makeRow('technical','Technical electives',available,options,available.length,6,`${Math.min(18,hours)} / 18 credits. CS 397 and 499 contribute at most 6 credits combined.`);tech.complete=available.length>=6&&hours>=18;rows.push(tech);
  const team=available.filter(c=>uiucTeam.includes(c)&&(c!=='CS 425'||credits(c)>=4));
  rows.push(makeRow('team','Team project',team,uiucTeam,team.length,1,'May also satisfy a focus-area course. CS 425 requires the 4-credit section.'));
  const focus=Object.entries(uiucFocus).map(([label,options])=>({label,options,finished:options.filter(c=>available.includes(c))})).sort((a,b)=>b.finished.length-a.finished.length);
  const best=focus[0];rows.push(makeRow('focus','Focus area',best.finished,unique(Object.values(uiucFocus).flat()),best.finished.length,3,`${best.label} is your closest match. Complete three courses within one area.`));
  for(const f of focus)rows.push({...makeRow('focus-detail-'+f.label,f.label,f.finished,f.options,f.finished.length,3),id:'optional-'+f.label});
  // At least eight distinct electives are needed for 6 technical + 2 advanced.
  // Team/focus remain subsets of technical electives, not additional slots.
  const advanced=makeRow('advanced','Additional advanced electives',available,options,Math.max(0,available.length-6),2,'Two courses / 6 credits beyond the six technical electives. Non-CS 400-level letter-graded courses may also qualify.');
  advanced.complete=available.length>=8&&hours>=24;
  rows.push(advanced);
  notes.push('The audit assumes letter grades for advanced electives. Non-CS advanced/science electives, general education, 40 upper-division credits, residency and GPA need transcript review.','500-level courses, outside-department substitutions and special-topic focus assignments require department approval.');
 }
 if(id==='vt'){
  const electives=courses.filter(c=>/^CS [345]\d{3}$/.test(c.code)&&!vtCore.includes(c.code)&&!vtExcluded.includes(c.code)&&credits(c.code)>=3).map(c=>c.code);
  const groups=[{label:'Theory elective',options:vtTheory,count:1},{label:'Capstone',options:vtCapstone,count:1},{label:'4000/5000-level elective',options:electives.filter(c=>/^CS [45]/.test(c)),count:1},{label:'3000/4000/5000-level electives',options:electives,count:2},{label:'Technical elective',options:electives,count:1}];
  const assigned=assignSlots(groups,eligible);
  groups.forEach((g,i)=>rows.push(makeRow('vt-'+i,g.label,assigned[i],g.options,assigned[i].length,g.count,i===1?'CS 4094 is the current standard; listed older capstones accommodate earlier completions.':'Each course fills one CS requirement.')));
  notes.push('Mathematics, statistics, science, engineering, communications, Pathways, the Career Bridge experience, grades and residency remain outside this CS-course audit.','Approved non-CS technical electives and individual substitutions must be checked against your official degree audit.');
 }
 if(id==='gatech'){
  const rules=threadRules(plan.track);
  if(!rules.length)notes.push('Choose your two Threads to calculate your required courses and electives.');
  // Full AND alternatives become a single token, never satisfied by one half.
  const token=(xs:string[])=>xs.join(' + ');
  const tokenDone=new Set<string>();
  for(const r of rules)for(const o of r.options)if(o.every(c=>eligible.has(c)))tokenDone.add(token(o));
  const groups=rules.map(r=>({options:r.options.map(token),count:r.count}));
  const assigned=assignSlots(groups,tokenDone);
  rules.forEach((r,i)=>{
   const found=assigned[i].flatMap(c=>c.split(' + '));
   const row=makeRow('thread-'+i,r.label,found,r.options.flat(),assigned[i].length,r.count,`${r.credits} required credits${r.options.some(o=>o.length>1)?'. Courses joined by + must all be completed.':''}`);
   row.complete=row.complete&&found.reduce((sum,c)=>sum+credits(c),0)>=r.credits;
   row.alternatives=r.options;rows.push(row);
  });
  if(rules.length){
   const paths=[['CS 3311','CS 3312','LMC 3431','LMC 3432'],['CS 4723','LMC 3403']];
   const ranked=paths.map(p=>({p,n:p.filter(c=>eligible.has(c)).length})).sort((a,b)=>b.n/b.p.length-a.n/a.p.length),best=ranked[0];
   const r=makeRow('junior','Junior design',best.p.filter(c=>eligible.has(c)),paths.flat(),best.n,best.p.length,'Complete one entire pathway. VIP, research and I2P pathways require a separate program review.');r.alternatives=paths;rows.push(r);
  }
  notes.push('Humanities, social sciences, lab-science sequences, free electives, grades and residency still require transcript review. Wellness is outside the 124 degree-credit total.','The planner assigns each course once. Catalog-approved cross-counting, VIP/research design pathways and substitutions require review.');
 }
 if(courses.some(c=>done.has(c.code)&&c.credits===null&&plan.creditOverrides[c.code]===undefined))notes.push('Some completed courses have variable credits. Enter their awarded credits to finish credit-based requirements.');
 const counted=rows.filter(r=>!r.id.startsWith('optional-')),total=counted.length,earned=counted.reduce((s,r)=>s+(r.complete?1:Math.min(0.99,r.earned/r.required)),0);
 return {rows,percent:total?Math.floor(100*earned/total):0,complete:counted.filter(r=>r.complete).length,total:counted.length,notes};
}
