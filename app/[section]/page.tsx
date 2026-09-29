import Workspace from '../workspace';
import {notFound} from 'next/navigation';
import {requireChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params;
 if(!['applications','opportunities','projects','ai-literacy','resumes','practice','courses','clubs'].includes(section))notFound();
 return <SignedInPage section={section}/>;
}
async function SignedInPage({section}:{section:string}){
 await requireChatGPTUser('/'+section);
 return <Workspace section={section}/>;
}
