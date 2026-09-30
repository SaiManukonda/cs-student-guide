export type CampusPlan={statuses:Record<string,'Planned'|'In progress'>;creditOverrides:Record<string,number>;otherCredits:number;checks:string[];track:string;threads:string[]};
export const emptyCampusPlan:CampusPlan={statuses:{},creditOverrides:{},otherCredits:0,checks:[],track:'',threads:[]};
export const campusCourseKey=(college:string,code:string)=>`${college}:${code}`;
