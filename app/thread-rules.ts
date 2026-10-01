import threads from './gatech-threads.json';
export type CourseRule={label:string;options:string[][];count:number;credits:number};
const codes=(s:string)=>s.match(/[A-Z]{2,4} \d{4}[A-Z]?/g)||[];
/** Catalog rows with an explicit credit value start a requirement. Empty-credit
 * rows following Select are alternatives, and `or` rows preserve AND bundles. */
export function threadRules(name:string){
 const pair=threads.find(p=>p.name===name),rules:CourseRule[]=[];
 let choice:CourseRule|undefined;
 for(const {label} of pair?.requirements||[]){
  const parts=label.split(' · '),head=parts[0],course=codes(head),credit=Number(parts.at(-1));
  if(head.startsWith('Select')){
   const count=/Select (?:at least )?(one|two|three)/i.exec(head)?.[1];
   choice={label:head.replace(/:.*$/,'').replace(/^Select .*? for /,'').replace(/^Select one of the following$/,'Probability and statistics'),options:[],count:count?({one:1,two:2,three:3}[count]||1):Math.ceil(credit/3),credits:credit};
   rules.push(choice);
  }else if(course.length){
   if(head.startsWith('or ')){
    const last=choice||rules.at(-1);last?.options.push(course);
   }else if(parts.length===3&&parts[2].trim()&&Number.isFinite(credit)){
    choice=undefined;
    // Wellness is outside the 124 degree credits and audited separately.
    const r={label:parts[1].replace(/\s+\d+(?:,\d+)*$/,''),options:[course],count:1,credits:credit};rules.push(r);
   }else if(choice)choice.options.push(course);
  }else choice=undefined;
 }
 return rules;
}
export function threadCourseExtras(){
 const rows=new Map<string,{code:string;title:string;credits:number|null;category:string;note:string;source:string}>();
 for(const pair of threads)for(const {label} of pair.requirements){
  const [head,title,value]=label.split(' · '),found=codes(head);
  if(found.length!==1||!title)continue;
  const n=Number(value);const credit=value?.trim()&&Number.isFinite(n)?n:null;
  const old=rows.get(found[0]);
  if(!old||old.credits===null)rows.set(found[0],{code:found[0],title:title.replace(/\s+\d+(?:,\d+)*$/,''),credits:credit,category:'Thread curriculum',note:'Eligibility depends on your selected Threads.',source:pair.source});
 }
 const extras:[string,string,number][]=[['LMC 3431','Technical Communication Approaches',1],['LMC 3432','Technical Communication Strategies',2],['LMC 3403','Technical Communication',3],['CS 3311','Project Design',1],['CS 3312','Project Implementation',2],['CS 4723','Interdisciplinary Design',3],['ISYE 2027','Probability with Applications',3],['ISYE 3030','Basic Statistical Methods',3]];
 for(const [code,title,credits] of extras)rows.set(code,{code,title,credits,category:'Thread curriculum',note:'',source:'https://catalog.gatech.edu/programs/computer-science-bs/'});
 return [...rows.values()];
}
