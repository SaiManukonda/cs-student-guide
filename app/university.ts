export const universityNames=['Rutgers–New Brunswick','University of Maryland–College Park','University of Illinois Urbana-Champaign','Georgia Tech','Virginia Tech'] as const;
export type UniversityName=typeof universityNames[number];
export const universities:Record<UniversityName,{id:string;name:string;campus:string;shortName:string;logo:string}>={
 'Rutgers–New Brunswick':{id:'rutgers',name:'Rutgers University',campus:'New Brunswick',shortName:'Rutgers',logo:'/branding/rutgers.svg'},
 'University of Maryland–College Park':{id:'umd',name:'University of Maryland',campus:'College Park',shortName:'UMD',logo:'/branding/umd-primary.jpg'},
 'University of Illinois Urbana-Champaign':{id:'uiuc',name:'University of Illinois',campus:'Urbana-Champaign',shortName:'UIUC',logo:'/branding/uiuc.svg'},
 'Georgia Tech':{id:'gatech',name:'Georgia Institute of Technology',campus:'Atlanta',shortName:'Georgia Tech',logo:'/branding/gatech.png'},
 'Virginia Tech':{id:'vt',name:'Virginia Tech',campus:'Blacksburg',shortName:'Virginia Tech',logo:'/branding/vt.svg'}
};
export function isUniversity(value:unknown):value is UniversityName{return typeof value==='string'&&universityNames.some(name=>name===value)}
