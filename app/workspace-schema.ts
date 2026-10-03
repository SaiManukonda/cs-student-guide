import {z} from 'zod';
import {universityNames} from './university';
const text=z.string().max(3000);
const courseCode=z.string().min(1).max(40);
const statuses=z.record(courseCode,z.enum(['Planned','In progress']));
const credits=z.record(courseCode,z.number().min(0).max(12));
const checks=z.array(z.string().max(120)).max(150);
const planner=z.object({degree:z.enum(['BS','BA']),statuses,creditOverrides:credits,otherCredits:z.number().min(0).max(250),transfer:z.array(z.string().max(30)).max(100),approvedIndependent:z.array(z.string().max(30)).max(100),science:z.string().max(40),checks});
const campusPlan=z.object({statuses,creditOverrides:credits,otherCredits:z.number().min(0).max(250),checks,track:z.string().max(150),threads:z.array(z.string().max(70)).max(2)});
export const projectLabSchema=z.object({files:z.object({'index.html':z.string().max(20000),'styles.css':z.string().max(20000),'app.js':z.string().max(20000)}),lesson:z.number().int().min(0).max(6),completed:z.array(z.number().int().min(0).max(6)).max(7),storage:z.record(z.string().max(120),z.string().max(10000)).refine(v=>Object.keys(v).length<=20&&JSON.stringify(v).length<=30000)});
function makeNotebookSchema(ids:[string,...string[]]){return z.object({cells:z.array(z.object({id:z.string().regex(/^[a-z0-9-]{1,60}$/),source:z.string().max(20000)})).min(ids.length).max(20).refine(c=>new Set(c.map(x=>x.id)).size===c.length&&ids.every(id=>c.some(x=>x.id===id))),completed:z.array(z.enum(ids)).max(ids.length).refine(c=>new Set(c).size===c.length)});}
export const notebookSchema=makeNotebookSchema(['load','clean','arrays','filter','group','report']);
export const mlNotebookSchema=makeNotebookSchema(['explore','split','baseline','train','evaluate','predict']);
export const workspaceSchema=z.object({
 notebooks:z.object({'campus-sales':notebookSchema.optional(),'iris-classifier':mlNotebookSchema.optional()}).strict().default({}),
 projectLabs:z.record(z.enum(['taskboard-basics']),projectLabSchema).default({}),
 planner:planner.optional(),collegePlans:z.record(z.enum(['umd','uiuc','gatech','vt','umich']),campusPlan).default({}),
 applications:z.array(z.object({id:z.string().uuid(),company:z.string().trim().min(1).max(120),role:z.string().trim().min(1).max(180),url:z.string().max(2000).refine(v=>!v||/^https?:\/\//.test(v)),status:z.enum(['Saved','Applied','Interviewing','Offer','Rejected']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),notes:text,employmentType:z.enum(['Not specified','Internship','Full-time']).default('Not specified')})).max(1000),
 projects:z.array(text).max(100),courses:z.array(text).max(1500),college:z.enum(universityNames),resumeSource:z.string().max(100000).default(''),practiceSolved:z.array(z.string().max(100)).max(100).default([]),
 submissions:z.array(z.object({id:z.string().uuid(),problem:z.string().max(100),language:z.enum(['javascript','python','java','cpp']).default('javascript'),passed:z.number().int().min(0).max(100),total:z.number().int().min(1).max(100),code:z.string().max(20000),date:z.string().max(40)})).max(200)
});
export const emptyWorkspace={notebooks:{},projectLabs:{},applications:[],projects:[],courses:[],college:'',collegePlans:{},resumeSource:'',practiceSolved:[],submissions:[]};
