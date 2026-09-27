import Workspace from '../workspace';
import { notFound } from 'next/navigation';
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!['applications','opportunities','projects','ai-literacy','resumes','practice','courses'].includes(section))notFound();return <Workspace section={section}/>}
