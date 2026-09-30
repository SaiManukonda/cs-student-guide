import ThemeToggle from './theme-toggle';
import {chatGPTSignInPath} from './chatgpt-auth';

const features=[
 ['Courses & clubs','Degree progress and campus clubs.'],
 ['Applications','Open roles and application tracking.'],
 ['Coding practice','Blind 75. JavaScript, Python, Java, C++.'],
 ['Projects','Ideas and build-along tutorials.'],
 ['Resumes','LaTeX templates, editor, and preview.'],
 ['AI & Git literacy','Step-by-step tool tutorials.'],
];

export default function Welcome({signedIn=false,returnTo='/courses'}:{signedIn?:boolean;returnTo?:string}){
 const href=signedIn?returnTo:chatGPTSignInPath(returnTo);
 return <main className="guide-welcome"><ThemeToggle/>
  <div className="guide-sheet">
   <header className="guide-heading"><h1>CompSci<span>Guide</span><span className="guide-period">.</span></h1><p>Your computer science workspace.</p></header>
   <section className="guide-features" aria-labelledby="features-title"><h2 id="features-title" className="sr-only">Inside your workspace</h2><dl>{features.map(([title,description])=><div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl></section>
   <div className="guide-start">{!signedIn&&<p className="guide-guest"><a className="secondary" href={returnTo}>Continue without signing in</a></p>}<a className="guide-signin" href={href} target="_top">{!signedIn&&<img src="/branding/openai-blossom.svg" width="22" height="22" alt="" aria-hidden="true"/>}<span>{signedIn?'Open your workspace':'Sign in with OpenAI'}</span></a><p className="guide-auth-note">{signedIn?'Your progress is saved to your account.':'Progress saves in this browser. Sign in to save across devices.'}</p></div>
  </div>
 </main>;
}
