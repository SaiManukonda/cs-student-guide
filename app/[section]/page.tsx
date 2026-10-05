import Workspace from '../workspace';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params;
 if(!['applications','opportunities','projects','ai-literacy','git-literacy','resumes','practice','ai-interviews','courses','clubs'].includes(section))notFound();
 return <Workspace section={section}/>;
}
