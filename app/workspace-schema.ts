import {z} from 'zod';
import {universityNames} from './university';
const text=z.string().max(3000);
const courseCode=z.string().min(1).max(40);
const statuses=z.record(courseCode,z.enum(['Planned','In progress']));
const credits=z.record(courseCode,z.number().min(0).max(12));
const checks=z.array(z.string().max(120)).max(150);
const planner=z.object({degree:z.enum(['BS','BA']),statuses,creditOverrides:credits,otherCredits:z.number().min(0).max(250),transfer:z.array(z.string().max(30)).max(100),approvedIndependent:z.array(z.string().max(30)).max(100),science:z.string().max(40),checks});
const campusPlan=z.object({statuses,creditOverrides:credits,otherCredits:z.number().min(0).max(250),checks,track:z.string().max(150),threads:z.array(z.string().max(70)).max(2)});
export const workspaceSchema=z.object({
 planner:planner.optional(),collegePlans:z.record(z.enum(['umd','uiuc','gatech','vt']),campusPlan).default({}),
 applications:z.array(z.object({id:z.string().uuid(),company:z.string().trim().min(1).max(120),role:z.string().trim().min(1).max(180),url:z.string().max(2000).refine(v=>!v||/^https?:\/\//.test(v)),status:z.enum(['Saved','Applied','Interviewing','Offer','Rejected']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),notes:text})).max(1000),
 projects:z.array(text).max(100),courses:z.array(text).max(1500),college:z.enum(universityNames),resumeSource:z.string().max(100000).default(''),practiceSolved:z.array(z.string().max(100)).max(100).default([]),
 submissions:z.array(z.object({id:z.string().uuid(),problem:z.string().max(100),language:z.enum(['javascript','python','java','cpp']).default('javascript'),passed:z.number().int().min(0).max(100),total:z.number().int().min(1).max(100),code:z.string().max(20000),date:z.string().max(40)})).max(200)
});
export const emptyWorkspace={applications:[],projects:[],courses:[],college:'',collegePlans:{},resumeSource:'',practiceSolved:[],submissions:[]};
