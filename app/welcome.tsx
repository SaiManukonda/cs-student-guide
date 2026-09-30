import {chatGPTSignInPath} from './chatgpt-auth';
const features=[
 ['01','Plan your degree','Track completed courses and degree credits. Explore your university’s course catalog and CS clubs.'],
 ['02','Find your next opportunity','Browse open internships and keep applications, interviews, and offers in one place.'],
 ['03','Build projects','Find project ideas with practical tutorials, then bookmark the ones you want to build.'],
 ['04','Practice coding','Work through the Blind 75. Run and submit solutions in JavaScript, Python, Java, or C++.'],
 ['05','Create your resume','Start with Jake’s Resume, edit the LaTeX, and preview your resume as you work.'],
 ['06','Learn the tools','Follow step-by-step AI and Git literacy courses, including working with Claude Code and version control.'],
];
export default function Welcome({signedIn=false,returnTo='/courses'}:{signedIn?:boolean;returnTo?:string}){
 const href=signedIn?returnTo:chatGPTSignInPath(returnTo);
 const label=signedIn?'Open your workspace':'Sign in with OpenAI';
 return <main className="guide-welcome">
  <header className="guide-header"><a className="guide-wordmark" href="/" aria-label="CompSci Guide home">CompSci<span>Guide</span><span className="guide-period">.</span></a><a className="guide-header-link" href={signedIn?returnTo:'#start'}>{signedIn?'Your workspace':'Get started'}</a></header>
  <section className="guide-intro" aria-labelledby="welcome-title"><div><p className="guide-eyebrow">THE COMPUTER SCIENCE STUDENT WORKSPACE</p><h1 id="welcome-title">Plan your degree.<br/>Build what comes next.</h1><p className="guide-description">Courses, coding practice, projects, and career prep—all in one place, tailored to your university.</p></div><div className="guide-start" id="start"><h2>{signedIn?'Welcome back.':'Start with your university.'}</h2><p>{signedIn?'Your courses, applications, and saved projects are ready when you are.':'Choose your school after signing in. Your progress stays saved to your account.'}</p><a className="primary guide-signin" href={href} target="_top">{label}</a>{!signedIn&&<p className="guide-auth-note">You’ll continue to OpenAI to sign in with your ChatGPT account, then return to CompSci Guide.</p>}<span className="guide-free">Free to use</span></div></section>
  <section className="guide-features" aria-labelledby="features-title"><div className="guide-section-heading"><h2 id="features-title">Inside your workspace</h2><span>From first class to first job</span></div><div className="guide-feature-grid">{features.map(([number,title,description])=><article key={number}><span className="guide-feature-number" aria-hidden="true">{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></section>
  <section className="guide-schools" aria-labelledby="schools-title"><h2 id="schools-title">Built around your campus</h2><p>Rutgers–New Brunswick <span>·</span> UMD–College Park <span>·</span> UIUC <span>·</span> Georgia Tech <span>·</span> Virginia Tech</p></section>
  <footer className="guide-footer"><span>CompSci Guide</span><p>An independent student guide. Not affiliated with OpenAI or the universities listed.</p></footer>
 </main>;
}
