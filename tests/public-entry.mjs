import assert from 'node:assert/strict';
const base='http://localhost:5173';
for(const path of ['/','/applications','/courses','/resumes','/practice']){
 const response=await fetch(base+path,{redirect:'manual'});
 assert.equal(response.status,200,`${path} must not redirect anonymous visitors`);
 assert.equal(response.headers.get('location'),null);
 const html=await response.text();
 assert.ok(html.includes('CompSci')&&html.includes('Inside your workspace'));
 assert.ok(html.includes('Sign in with OpenAI'));
 const destination=path==='/'?'/courses':path;
 assert.ok(html.includes('/signin-with-chatgpt?return_to='+encodeURIComponent(destination)),'sign-in returns to requested section');
 assert.ok(!html.includes('Your workspace could not load'));
}
const anon=await (await fetch(base+'/api/state')).json();
assert.equal(anon.user,null);assert.equal(anon.state.applications.length,0);
const save=await fetch(base+'/api/state',{method:'PUT',headers:{'Content-Type':'application/json',Origin:base},body:'{}'});
assert.equal(save.status,401,'anonymous users cannot save private data');
const signed=await fetch(base+'/',{headers:{Cookie:'__sites_local_auth=1'}});
assert.ok((await signed.text()).includes('Open your workspace'));
console.log('Public landing, direct links, explicit sign-in destinations, signed-in entry and API authorization passed.');
