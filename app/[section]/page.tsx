import Workspace from '../workspace';
import {notFound,redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params;
 if(section==='ai-literacy')redirect('/ai-interviews');
 if(!['applications','opportunities','projects','git-literacy','resumes','practice','ai-interviews','courses','clubs'].includes(section))notFound();
 return <Workspace section={section}/>;
}
