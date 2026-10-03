'use client';
import {useEffect,useRef,useState,useId} from 'react';
import {basicSetup} from 'codemirror';
import {Compartment,EditorState} from '@codemirror/state';
import {EditorView,keymap} from '@codemirror/view';
import {indentWithTab} from '@codemirror/commands';
import {indentUnit} from '@codemirror/language';
import {javascript} from '@codemirror/lang-javascript';
import {html} from '@codemirror/lang-html';
import {css} from '@codemirror/lang-css';
import {python} from '@codemirror/lang-python';
import {java} from '@codemirror/lang-java';
import {cpp} from '@codemirror/lang-cpp';
import {oneDark} from '@codemirror/theme-one-dark';
import type {Language} from './practice-data/catalog';
const modes={javascript,python,java,cpp,html,css};
const palette=(dark:boolean)=>EditorView.theme({
 '&':{backgroundColor:dark?'#211f1b':'#fffaf0',color:dark?'#f4ead6':'#201c16'},
 '.cm-content':{caretColor:dark?'#8bd7ca':'#285951'},
 '.cm-cursor,.cm-dropCursor':{borderLeftColor:dark?'#8bd7ca':'#285951'},
 '.cm-gutters':{backgroundColor:dark?'#1b1916':'#eee8d9',color:dark?'#b4aa96':'#746c5c',borderRight:'1px solid '+(dark?'#494337':'#d3ccbd')},
 '.cm-activeLine,.cm-activeLineGutter':{backgroundColor:dark?'#2b2821':'#f0ecdf'},
 '&.cm-focused .cm-selectionBackground,.cm-selectionBackground,::selection':{backgroundColor:dark?'#34534b':'#d0e0d7'},
 '.cm-tooltip':{backgroundColor:dark?'#2b2821':'#fffaf0',color:dark?'#f4ead6':'#201c16',border:'1px solid '+(dark?'#696255':'#aaa28e')},
 '.cm-tooltip-autocomplete > ul > li[aria-selected]':{backgroundColor:dark?'#18352f':'#d0e0d7',color:dark?'#8bd7ca':'#201c16'},
 '.cm-panels':{backgroundColor:dark?'#2b2821':'#eee8d9',color:dark?'#f4ead6':'#201c16'},
},{dark});
export default function CodeEditor({value,onChange,language,disabled=false,label}:{value:string;onChange:(value:string)=>void;language:Language|'html'|'css';disabled?:boolean;label?:string}){
 const shortcutsId=useId();
 const host=useRef<HTMLDivElement>(null),view=useRef<EditorView|null>(null),change=useRef(onChange);
 change.current=onChange;
 const [position,setPosition]=useState({line:1,column:1});
 const theme=useRef(new Compartment()),readonly=useRef(new Compartment());
 useEffect(()=>{
  if(!host.current)return;
  const appearance=()=>{const dark=document.documentElement.classList.contains('dark');return [palette(dark),...(dark?[oneDark]:[])]};
  const editor=new EditorView({parent:host.current,state:EditorState.create({doc:value,extensions:[
   basicSetup,modes[language](),indentUnit.of('    '),EditorState.tabSize.of(4),keymap.of([indentWithTab]),
   EditorView.contentAttributes.of({'aria-label':label||`Your ${language} solution`,'aria-describedby':shortcutsId,spellcheck:'false',autocapitalize:'off',autocorrect:'off'}),
   theme.current.of(appearance()),readonly.current.of(EditorState.readOnly.of(disabled)),
   EditorState.transactionFilter.of(tr=>tr.newDoc.length>20000?[]:tr),
   EditorView.updateListener.of(update=>{
    if(update.docChanged)change.current(update.state.doc.toString());
    if(update.docChanged||update.selectionSet){const head=update.state.selection.main.head,line=update.state.doc.lineAt(head);setPosition({line:line.number,column:head-line.from+1})}
   }),
  ]})});
  view.current=editor;
  const observer=new MutationObserver(()=>editor.dispatch({effects:theme.current.reconfigure(appearance())}));
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  return()=>{observer.disconnect();editor.destroy();view.current=null};
  // Each problem/language mounts its own editor via the parent's key.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{const editor=view.current;if(editor&&editor.state.doc.toString()!==value)editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:value}})},[value]);
 useEffect(()=>{view.current?.dispatch({effects:readonly.current.reconfigure(EditorState.readOnly.of(disabled))})},[disabled]);
 return <><div className="ide-editor" ref={host}/><div className="ide-status"><span>Ln {position.line}, Col {position.column}</span><span id={shortcutsId}>Tab: indent · Esc then Tab: leave editor</span><span>Spaces: 4</span></div></>;
}
