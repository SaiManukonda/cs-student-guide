import {campusCourses,campusProgram} from './campus-programs';
import {campusCourseKey,type CampusPlan} from './campus-plan';
import type {AuditRow,CampusAudit} from './campus-audit';
import {michiganMath} from './umich-program';
import rules from './umich-rules.json';

/** Evaluate the 2026–27 Ann Arbor programs from completed classes. */
export function michiganAudit(completed:string[],plan:CampusPlan):CampusAudit{
 const notes=['This is the 2026–27 CS curriculum. Grades, approved substitutions, prerequisites, residency and admission/declaration rules require transcript review.','LSA distribution, language, writing and the 100 LSA-credit rule, or Engineering intellectual breadth and other college requirements, are not inferred from CS classes. Add accepted credits outside this catalog under Other requirements.','Special topics and multi-semester design projects need term/project approval and are not automatically allocated. Cross-listed/equivalent credits must be entered only once.'];
 if(!['CS-LSA','CS-Eng'].includes(plan.track))return {rows:[],percent:0,complete:0,total:0,notes};
 const eng=plan.track==='CS-Eng',courses=campusCourses('umich'),byCode=new Map(courses.map(c=>[c.code,c]));
 const credits=(code:string)=>plan.creditOverrides[code]??byCode.get(code)?.credits??0;
 const done=new Set(courses.filter(c=>completed.includes(campusCourseKey('umich',c.code))&&plan.creditOverrides[c.code]!==0).map(c=>c.code));
 // The same cross-listed probability course cannot fill two requirements.
 for(const n of ['425','525','526'])if(done.has('MATH '+n))done.delete('STATS '+n);
 const rows:AuditRow[]=[],used=new Set<string>();
 const row=(id:string,label:string,options:string[],found:string[],earned:number,required:number,detail='',unit='courses')=>{
  const r:AuditRow={id,label,options:[...new Set(options)],completed:found,earned:Math.min(earned,required),required,unit,complete:earned>=required,detail};rows.push(r);return r;
 };
 const flexEligible=(code:string)=>{
  if(rules.flex.includes(code))return true;
  if(rules.capstone.includes(code))return ['EECS 473','EECS 494'].includes(code);
  const [dept,num]=code.split(' '),n=Number(num);
  if(['EECS','CSE','ECE'].includes(dept)&&n>=300)return ![398,402,406,409,410,496,498,598].includes(n);
  if(dept==='MATH'&&n>=300)return ![310,327,333,385,389,399,417,419,422,429,431,485,486,489,497].includes(n);
  return false;
 };
 for(const [i,options] of campusProgram('umich',plan).core.entries()){
  // Prefer a non-elective alternative when both have been completed.
  const found=options.filter(c=>done.has(c)&&!used.has(c)).sort((a,b)=>Number(flexEligible(a))-Number(flexEligible(b))).slice(0,1);
  found.forEach(c=>used.add(c));row('core-'+i,options===rules.stats?'Probability & statistics':options.join(' or '),options,found,found.length,1,byCode.get(options[0])?.title||'');
 }
 if(!eng){
  const found=michiganMath.map(g=>g.find(c=>done.has(c)&&!used.has(c))).filter((c):c is string=>!!c).slice(0,2);
  found.forEach(c=>used.add(c));row('math','Mathematics: two different areas',michiganMath.flat(),found,found.length,2,'Choose two different areas: Calculus I, Calculus II, linear algebra, multivariable calculus, or differential equations. Two courses in the same area count once.');
 }else{
  const alternatives=[['CHEM 125','CHEM 126','CHEM 130'],['CHEM 210','CHEM 211']];
  const best=[...alternatives].sort((a,b)=>b.filter(c=>done.has(c)).length/b.length-a.filter(c=>done.has(c)).length/a.length)[0];
  const found=best.filter(c=>done.has(c));found.forEach(c=>used.add(c));
  const chem=row('chemistry','Chemistry sequence',alternatives.flat(),found,found.length===best.length?1:0,1,'Complete CHEM 125 + 126 + 130, or CHEM 210 + 211.','sequences');chem.alternatives=alternatives;
  const comm=['TCHNCLCM 300','ROB 204'];const foundComm=comm.filter(c=>done.has(c)).slice(0,1);
  row('communication','Technical communication',comm,foundComm,foundComm.length,1,'ROB 204 used as a flexible technical elective waives TCHNCLCM 300. TCHNCLCM 497 must be taken with or after the capstone; timing is not checked.');
 }
 // Reserve a capstone that would otherwise cost the fewest technical credits.
 const cap=rules.capstone.filter(c=>done.has(c)).sort((a,b)=>Number(flexEligible(a))-Number(flexEligible(b))).slice(0,1);
 cap.forEach(c=>used.add(c));row('capstone','CS capstone',rules.capstone,cap,cap.length,1,'A separate approved capstone. EECS 472 replaces EECS 470 for current capstone credit. EECS 447 begins Winter 2027. Thesis/project approvals still apply.');
 const regular=rules.ulcs.filter(c=>done.has(c)&&!used.has(c));
 const expanded=rules.expanded.filter(c=>done.has(c)&&!used.has(c)&&!regular.includes(c));
 const sum=(xs:string[])=>xs.reduce((s,c)=>s+credits(c),0),regularCredits=sum(regular);
 row('ulcs-minimum','Regular upper-level CS electives',rules.ulcs,regular,regularCredits,12,'At least 12 credits must come from the regular ULCS list. EECS 404 begins Winter 2027.','credits');
 row('ulcs-total','Upper-level CS elective total',[...rules.ulcs,...rules.expanded],[...regular,...expanded],regularCredits+Math.min(3,sum(expanded)),15,'15 credits total; at most 3 may come from Expanded ULCS. Extra regular ULCS credits also qualify. Graduate courses may require enrollment permission.','credits');
 if(eng){
  const options=courses.filter(c=>flexEligible(c.code)).map(c=>c.code);
  const found=options.filter(c=>done.has(c)&&!used.has(c));
  const research=found.filter(c=>rules.research.includes(c));
  row('technical-total','Technical elective total',options,found,sum(found.filter(c=>!research.includes(c)))+Math.min(4,sum(research)),25,'25 total technical elective credits, including the 15 ULCS credits above. Required classes and the selected capstone are excluded. Directed study/research contributes at most 4 credits. The full published flexibility rules are under Other requirements.','credits');
 }
 return {rows,percent:Math.floor(100*rows.reduce((s,r)=>s+r.earned/r.required,0)/rows.length),complete:rows.filter(r=>r.complete).length,total:rows.length,notes};
}
