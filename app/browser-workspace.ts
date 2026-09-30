import {workspaceSchema} from './workspace-schema';
import {emptyPlanner} from './rutgers-courses';
import type {SavedState} from './workspace';
export const browserWorkspaceKey='compsciguide:guest-workspace:v1';
export function readBrowserWorkspace(storage:Pick<Storage,'getItem'>):SavedState|null{
 try{const raw=storage.getItem(browserWorkspaceKey);if(!raw)return null;const parsed=workspaceSchema.parse(JSON.parse(raw));return {...parsed,planner:parsed.planner||emptyPlanner} as SavedState;}
 catch{throw new Error('Your browser progress could not be read. It has not been overwritten. Try another browser or sign in to use your account.');}
}
export function writeBrowserWorkspace(storage:Pick<Storage,'setItem'>,state:SavedState){
 const parsed=workspaceSchema.parse(state);
 try{storage.setItem(browserWorkspaceKey,JSON.stringify(parsed));}
 catch{throw new Error('This browser could not save your progress. Allow site storage or sign in to save to your account.');}
}
const union=<T,>(a:T[],b:T[])=>[...new Set([...a,...b])];
const records=<T extends {id:string},>(local:T[],cloud:T[])=>[...new Map([...local,...cloud].map(item=>[item.id,item])).values()];
export function importBrowserWorkspace(local:SavedState,cloud:SavedState):SavedState{
 if(!cloud.college)return local;
 const campusPlans={...local.collegePlans,...cloud.collegePlans};
 // Existing account settings win; completed work and distinct saved items are combined.
 for(const id of Object.keys(campusPlans)){
  const a=local.collegePlans[id],b=cloud.collegePlans[id];
  if(a&&b)campusPlans[id]={...a,...b,statuses:{...a.statuses,...b.statuses},creditOverrides:{...a.creditOverrides,...b.creditOverrides},checks:union(a.checks,b.checks)};
 }
 const a=local.planner,b=cloud.planner;
 const planner={...a,...b,statuses:{...a.statuses,...b.statuses},creditOverrides:{...a.creditOverrides,...b.creditOverrides},checks:union(a.checks,b.checks),transfer:union(a.transfer,b.transfer),approvedIndependent:union(a.approvedIndependent,b.approvedIndependent)};
 return {...cloud,planner,collegePlans:campusPlans,applications:records(local.applications,cloud.applications),projects:union(local.projects,cloud.projects),courses:union(local.courses,cloud.courses),practiceSolved:union(local.practiceSolved,cloud.practiceSolved),submissions:records(local.submissions,cloud.submissions).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,200),resumeSource:cloud.resumeSource||local.resumeSource};
}
