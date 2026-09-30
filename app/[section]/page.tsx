import Workspace from '../workspace';
import {notFound} from 'next/navigation';
import {getChatGPTUser} from '../chatgpt-auth';
import Welcome from '../welcome';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params;
 if(!['applications','opportunities','projects','ai-literacy','git-literacy','resumes','practice','courses','clubs'].includes(section))notFound();
 return <SignedInPage section={section}/>;
}
async function SignedInPage({section}:{section:string}){
 const user=await getChatGPTUser();
 if(!user)return <Welcome returnTo={'/'+section}/>;
 return <Workspace section={section}/>;
}
