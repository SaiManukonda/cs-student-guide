'use client';
import {useEffect,useRef,useState} from 'react';
export default function PdfPreview({url}:{url:string}){
 const container=useRef<HTMLDivElement>(null);const [error,setError]=useState(''),[pages,setPages]=useState(0);
 useEffect(()=>{let cancelled=false;let task:{destroy:()=>Promise<void>}|undefined;const root=container.current!;root.replaceChildren();setError('');setPages(0);
 (async()=>{try{const pdfjs=await import('pdfjs-dist');if(cancelled)return;pdfjs.GlobalWorkerOptions.workerSrc='/vendor/pdfjs/pdf.worker.min.mjs';const loading=pdfjs.getDocument({url});task=loading;const pdf=await loading.promise;if(cancelled)return;setPages(pdf.numPages);for(let i=1;i<=pdf.numPages;i++){if(cancelled)return;const page=await pdf.getPage(i);const viewport=page.getViewport({scale:1.5});const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`Resume page ${i} of ${pdf.numPages}`);root.appendChild(canvas);await page.render({canvas,viewport}).promise;}}catch(e){if(!cancelled)setError('PDF display failed. You can still download the compiled PDF.')}})();return()=>{cancelled=true;task?.destroy();root.replaceChildren()};
 },[url]);
 return <div className="pdf-document"><div role="status">{error||(!pages?'Rendering PDF…':`${pages} ${pages===1?'page':'pages'}`)}</div><div ref={container}/></div>;
}
