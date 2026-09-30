import catalog from './rutgers-catalog.json';
export type Course={code:string;title:string;credits:number|null;category:string;department:string;description:string;prerequisites:string;source:string;offering?:string;independent?:boolean};
export const courses:Course[]=catalog;
export type CourseStatus='Not started'|'Planned'|'In progress'|'Completed';
export type Planner={degree:'BS'|'BA';statuses:Record<string,'Planned'|'In progress'>;creditOverrides:Record<string,number>;otherCredits:number;transfer:string[];approvedIndependent:string[];science:string;checks:string[]};
export const emptyPlanner:Planner={degree:'BS',statuses:{},creditOverrides:{},otherCredits:0,transfer:[],approvedIndependent:[],science:'general',checks:[]};
export const courseKey=(code:string)=>'Rutgers–New Brunswick:'+code;
export const sequences=[
 {id:'general',name:'General physics',codes:['01:750:203','01:750:204','01:750:205','01:750:206']},
 {id:'analytical',name:'Analytical physics',codes:['01:750:123','01:750:124','01:750:227','01:750:229']},
 {id:'honors-physics',name:'Honors physics',codes:['01:750:271','01:750:272','01:750:275','01:750:276']},
 {id:'extended',name:'Extended general physics',codes:['01:750:201','01:750:202']},
 {id:'sciences',name:'Physics for the sciences',codes:['01:750:193','01:750:194']},
 {id:'engineering-chem',name:'Chemistry for engineers',codes:['01:160:159','01:160:160','01:160:171']},
 {id:'general-chem',name:'General chemistry',codes:['01:160:161','01:160:162','01:160:171']},
 {id:'honors-chem',name:'Honors chemistry',codes:['01:160:163','01:160:164','01:160:171']}
];
export const graduationChecks=[
 ['contemporary','Contemporary challenges','Your certified SAS Core courses satisfy both CCD and CCO goals.'],
 ['natural','Natural sciences','Your SAS Core natural-sciences requirements are complete.'],
 ['social','Social and historical analysis','Your SAS Core social and historical analysis requirements are complete.'],
 ['humanities','Arts and humanities','Your SAS Core arts and humanities requirements are complete.'],
 ['writing','Writing and communication','Your WC, WCr, and WCd requirements are complete.'],
 ['quantitative','Quantitative and formal reasoning','Your QQ and QR requirements are complete.'],
 ['minor','Minor or approved waiver','Your minor is complete or SAS has approved a waiver.'],
 ['gpa','University GPA','Your cumulative Rutgers GPA is at least 2.000.'],
 ['grades','CS grades and course age','No more than one D in major coursework; prerequisites met with C or better; electives within the ten-year limit.'],
 ['residency','University residency','At least 30 of your final 42 credits are at Rutgers–New Brunswick or an approved program.']
] as const;
export function courseStatus(code:string,completed:string[],planner:Planner):CourseStatus{return completed.includes(courseKey(code))?'Completed':planner.statuses[code]||'Not started'}
export function degreeProgress(completed:string[],p:Planner){
 const done=courses.filter(c=>completed.includes(courseKey(c.code)));
 const credits=done.reduce((sum,c)=>sum+(p.creditOverrides[c.code]??c.credits??0),0)+p.otherCredits;
 const core=done.filter(c=>c.category==='CS core'||c.category==='Math core');
 const target=p.degree==='BS'?7:5,nbTarget=p.degree==='BS'?5:3;
 let independentUsed=false;
 const electives=done.filter(c=>c.category==='Elective').filter(c=>{if(!c.independent)return true;if(independentUsed||!p.approvedIndependent.includes(c.code))return false;independentUsed=true;return true});
 const nb=(c:Course)=>c.department==='Computer Science'&&!p.transfer.includes(c.code);
 const upper=electives.filter(c=>nb(c)&&Number(c.code.split(':')[2])>=300);
 // Allocate disjoint slots: two upper-level NB CS, remaining NB CS, then two open slots.
 const chosen=new Set(upper.slice(0,2).map(c=>c.code));
 const otherNB=electives.filter(c=>nb(c)&&!chosen.has(c.code));
 otherNB.slice(0,nbTarget-2).forEach(c=>chosen.add(c.code));
 const open=electives.filter(c=>!chosen.has(c.code));
 open.slice(0,target-nbTarget).forEach(c=>chosen.add(c.code));
 const science=sequences.map(s=>({...s,done:s.codes.filter(code=>completed.includes(courseKey(code))).length}));
 const bestScience=Math.max(...science.map(s=>s.done/s.codes.length));
 const nbCount=done.filter(c=>nb(c)&&(c.category==='CS core'||chosen.has(c.code))).length;
 const majorUnits=9+target+(p.degree==='BS'?1:0)+1;
 const earned=core.length+chosen.size+(p.degree==='BS'?bestScience:0)+Math.min(nbCount/7,1);
 return {credits,creditPercent:Math.min(100,Math.floor(credits/120*100)),core:core.length,csCore:core.filter(c=>c.category==='CS core').length,mathCore:core.filter(c=>c.category==='Math core').length,target,nbTarget,electives:chosen.size,nbElectives:electives.filter(nb).length,upper:upper.length,nbCount,science,scienceComplete:bestScience===1,majorPercent:Math.min(100,Math.floor(earned/majorUnits*100)),completed:done.length,planned:Object.values(p.statuses).filter(s=>s==='Planned').length,inProgress:Object.values(p.statuses).filter(s=>s==='In progress').length,unknownCredits:done.filter(c=>c.credits===null&&p.creditOverrides[c.code]===undefined).length};
}
