// Trusted, test-only reference implementations. Never imported by the website.
export function tree(a){if(!a.length||a[0]===null)return null;const r={val:a[0]},q=[r];let i=1;for(const n of q)for(const k of ['left','right'])if(i<a.length){const v=a[i++];if(v!==null){n[k]={val:v};q.push(n[k])}}return r}
export function flat(r){if(!r)return [];const a=[],q=[r];for(const n of q){a.push(n?n.val:null);if(n)q.push(n.left,n.right)}while(a.at(-1)===null)a.pop();return a}
export function bst(a){if(!a.length)return null;const m=a.length>>1;return {val:a[m],left:bst(a.slice(0,m)),right:bst(a.slice(m+1))}}
export function traversal(r,key){return !r?[]:key==='pre'?[r.val,...traversal(r.left,key),...traversal(r.right,key)]:[...traversal(r.left,key),r.val,...traversal(r.right,key)]}
function merge(a){const out=[];for(const [s,e] of a.toSorted((a,b)=>a[0]-b[0])){if(out.length&&out.at(-1)[1]>=s)out.at(-1)[1]=Math.max(out.at(-1)[1],e);else out.push([s,e])}return out}
function rob(a){let x=0,y=0;for(const v of a)[x,y]=[y,Math.max(y,x+v)];return y}
function components(n,edges){const a=Array.from({length:n},()=>[]);for(const [x,y]of edges){a[x].push(y);a[y].push(x)}const seen=new Set();let count=0;for(let i=0;i<n;i++)if(!seen.has(i)){count++;const q=[i];seen.add(i);for(const v of q)for(const w of a[v])if(!seen.has(w)){seen.add(w);q.push(w)}}return count}
function equal(a,b){return (!a||!b)?!a&&!b:a.val===b.val&&equal(a.left,b.left)&&equal(a.right,b.right)}
function depth(r){return r?1+Math.max(depth(r.left),depth(r.right)):0}
function exists(board,word){if(!word)return true;if(!board.length)return false;const m=board.length,n=board[0].length,used=new Set();function go(r,c,i){const k=r*n+c;if(r<0||c<0||r>=m||c>=n||used.has(k)||board[r][c]!==word[i])return false;if(i===word.length-1)return true;used.add(k);const ok=go(r+1,c,i+1)||go(r-1,c,i+1)||go(r,c+1,i+1)||go(r,c-1,i+1);used.delete(k);return ok}for(let r=0;r<m;r++)for(let c=0;c<n;c++)if(go(r,c,0))return true;return false}
export function reference(id,args){const [a,b,c]=structuredClone(args);
 switch(id){
 case 'two-sum':{const seen=new Map();for(let i=0;i<a.length;i++){if(seen.has(b-a[i]))return [seen.get(b-a[i]),i];seen.set(a[i],i)}throw Error('No pair')}
 case 'best-time-to-buy-and-sell-stock':{let min=Infinity,best=0;for(const v of a){best=Math.max(best,v-min);min=Math.min(min,v)}return best}
 case 'contains-duplicate':return new Set(a).size!==a.length;
 case 'product-of-array-except-self':return a.map((_,i)=>a.reduce((v,x,j)=>i===j?v:v*x,1));
 case 'maximum-subarray':{let best=a[0],sum=0;for(const x of a){sum=Math.max(x,sum+x);best=Math.max(best,sum)}return best}
 case 'maximum-product-subarray':{let best=a[0],hi=1,lo=1;for(const x of a){[hi,lo]=[Math.max(x,x*hi,x*lo),Math.min(x,x*hi,x*lo)];best=Math.max(best,hi)}return best}
 case 'find-minimum-in-rotated-sorted-array':return Math.min(...a);
 case 'search-in-rotated-sorted-array':return a.indexOf(b);
 case '3sum':{const out=[];a.sort((x,y)=>x-y);for(let i=0;i<a.length-2;i++){if(i&&a[i]===a[i-1])continue;let l=i+1,r=a.length-1;while(l<r){const s=a[i]+a[l]+a[r];if(s<0)l++;else if(s>0)r--;else{out.push([a[i],a[l],a[r]]);const v=a[l++],w=a[r--];while(l<r&&a[l]===v)l++;while(l<r&&a[r]===w)r--}}}return out}
 case 'container-with-most-water':{let best=0;for(let i=0,j=a.length-1;i<j;){best=Math.max(best,(j-i)*Math.min(a[i],a[j]));if(a[i]<a[j])i++;else j--}return best}
 case 'sum-of-two-integers':return a+b;
 case 'number-of-1-bits':return [...(a>>>0).toString(2)].filter(x=>x==='1').length;
 case 'counting-bits':return Array.from({length:a+1},(_,i)=>i.toString(2).replaceAll('0','').length);
 case 'missing-number':return a.length*(a.length+1)/2-a.reduce((s,v)=>s+v,0);
 case 'reverse-bits':return parseInt((a>>>0).toString(2).padStart(32,'0').split('').reverse().join(''),2);
 case 'climbing-stairs':{let x=1,y=1;for(let i=1;i<a;i++)[x,y]=[y,x+y];return y}
 case 'coin-change':{const dp=Array(b+1).fill(Infinity);dp[0]=0;for(let i=1;i<=b;i++)for(const coin of a)if(coin<=i)dp[i]=Math.min(dp[i],dp[i-coin]+1);return Number.isFinite(dp[b])?dp[b]:-1}
 case 'longest-increasing-subsequence':{const tails=[];for(const x of a){let l=0,r=tails.length;while(l<r){const m=(l+r)>>1;if(tails[m]<x)l=m+1;else r=m}tails[l]=x}return tails.length}
 case 'longest-common-subsequence':{let dp=Array(b.length+1).fill(0);for(const x of a){const next=[0];for(let j=1;j<=b.length;j++)next[j]=x===b[j-1]?dp[j-1]+1:Math.max(dp[j],next[j-1]);dp=next}return dp[b.length]}
 case 'word-break':{const dp=Array(a.length+1).fill(false);dp[0]=true;for(let i=1;i<=a.length;i++)for(const w of b)if(i>=w.length&&dp[i-w.length]&&a.slice(i-w.length,i)===w)dp[i]=true;return dp[a.length]}
 case 'combination-sum-iv':{const dp=Array(b+1).fill(0);dp[0]=1;for(let i=1;i<=b;i++)for(const v of a)if(v<=i)dp[i]+=dp[i-v];return dp[b]}
 case 'house-robber':return rob(a);
 case 'house-robber-ii':return a.length===1?a[0]:Math.max(rob(a.slice(1)),rob(a.slice(0,-1)));
 case 'decode-ways':{let prev=1,cur=a[0]==='0'?0:1;for(let i=1;i<a.length;i++){const pair=Number(a.slice(i-1,i+1)),next=(a[i]!=='0'?cur:0)+(pair>=10&&pair<=26?prev:0);prev=cur;cur=next}return cur}
 case 'unique-paths':{const dp=Array(b).fill(1);for(let i=1;i<a;i++)for(let j=1;j<b;j++)dp[j]+=dp[j-1];return dp.at(-1)}
 case 'jump-game':{let reach=0;for(let i=0;i<a.length;i++){if(i>reach)return false;reach=Math.max(reach,i+a[i])}return true}
 case 'clone-graph':case 'encode-and-decode-strings':return a;
 case 'course-schedule':{const deg=Array(a).fill(0),edges=Array.from({length:a},()=>[]);for(const [v,u]of b){edges[u].push(v);deg[v]++}const q=[];for(let i=0;i<a;i++)if(!deg[i])q.push(i);for(const u of q)for(const v of edges[u])if(--deg[v]===0)q.push(v);return q.length===a}
 case 'pacific-atlantic-water-flow':{const m=a.length,n=a[0].length;function ocean(starts){const seen=new Set(starts.map(([r,c])=>r*n+c)),q=[...starts];for(const [r,c]of q)for(const [x,y]of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]])if(x>=0&&y>=0&&x<m&&y<n&&!seen.has(x*n+y)&&a[x][y]>=a[r][c]){seen.add(x*n+y);q.push([x,y])}return seen}const p=ocean([...a.map((_,r)=>[r,0]),...a[0].map((_,c)=>[0,c])]),t=ocean([...a.map((_,r)=>[r,n-1]),...a[0].map((_,c)=>[m-1,c])]);return [...p].filter(k=>t.has(k)).map(k=>[Math.floor(k/n),k%n])}
 case 'number-of-islands':{let count=0;for(let r=0;r<a.length;r++)for(let c=0;c<a[0].length;c++)if(a[r][c]==='1'){count++;a[r][c]='0';const q=[[r,c]];for(const [x,y]of q)for(const [i,j]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]])if(a[i]?.[j]==='1'){a[i][j]='0';q.push([i,j])}}return count}
 case 'longest-consecutive-sequence':{const set=new Set(a);let best=0;for(const x of set)if(!set.has(x-1)){let y=x;while(set.has(y))y++;best=Math.max(best,y-x)}return best}
 case 'alien-dictionary':{const edges=new Map([...new Set(a.join(''))].map(x=>[x,new Set()])),deg=new Map([...edges.keys()].map(x=>[x,0]));for(let i=1;i<a.length;i++){let j=0;while(j<a[i-1].length&&j<a[i].length&&a[i-1][j]===a[i][j])j++;if(j===a[i].length&&a[i-1].length>j)return '';if(j<a[i-1].length&&j<a[i].length&&!edges.get(a[i-1][j]).has(a[i][j])){edges.get(a[i-1][j]).add(a[i][j]);deg.set(a[i][j],deg.get(a[i][j])+1)}}const q=[...deg.keys()].filter(x=>!deg.get(x));for(const x of q)for(const y of edges.get(x)){deg.set(y,deg.get(y)-1);if(!deg.get(y))q.push(y)}return q.length===deg.size?q.join(''):''}
 case 'graph-valid-tree':return b.length===a-1&&components(a,b)===1;
 case 'number-of-connected-components-in-an-undirected-graph':return components(a,b);
 case 'insert-interval':return merge([...a,b]);
 case 'merge-intervals':return merge(a);
 case 'non-overlapping-intervals':{a.sort((x,y)=>x[1]-y[1]);let end=-Infinity,kept=0;for(const [s,e]of a)if(s>=end){kept++;end=e}return a.length-kept}
 case 'meeting-rooms':{a.sort((x,y)=>x[0]-y[0]);return a.every((v,i)=>i===0||v[0]>=a[i-1][1])}
 case 'meeting-rooms-ii':{const events=a.flatMap(([s,e])=>[[s,1],[e,-1]]).sort((x,y)=>x[0]-y[0]||x[1]-y[1]);let rooms=0,best=0;for(const [,d]of events){rooms+=d;best=Math.max(best,rooms)}return best}
 case 'reverse-linked-list':return a.reverse();
 case 'linked-list-cycle':return b>=0;
 case 'merge-two-sorted-lists':return [...a,...b].sort((x,y)=>x-y);
 case 'merge-k-sorted-lists':return a.flat().sort((x,y)=>x-y);
 case 'remove-nth-node-from-end-of-list':return a.filter((_,i)=>i!==a.length-b);
 case 'reorder-list':{const out=[];for(let l=0,r=a.length-1;l<=r;l++,r--){out.push(a[l]);if(l!==r)out.push(a[r])}return out}
 case 'set-matrix-zeroes':{const rows=new Set(),cols=new Set();a.forEach((row,r)=>row.forEach((v,c)=>{if(!v){rows.add(r);cols.add(c)}}));return a.map((row,r)=>row.map((v,c)=>rows.has(r)||cols.has(c)?0:v))}
 case 'spiral-matrix':{if(!a.length)return [];const out=[];let t=0,l=0,b=a.length-1,r=a[0].length-1;while(t<=b&&l<=r){for(let j=l;j<=r;j++)out.push(a[t][j]);t++;for(let i=t;i<=b;i++)out.push(a[i][r]);r--;if(t<=b){for(let j=r;j>=l;j--)out.push(a[b][j]);b--}if(l<=r){for(let i=b;i>=t;i--)out.push(a[i][l]);l++}}return out}
 case 'rotate-image':return a.map((row,r)=>row.map((_,c)=>a[a.length-1-c][r]));
 case 'word-search':return exists(a,b);
 case 'word-search-ii':return b.filter(w=>exists(a,w));
 case 'longest-substring-without-repeating-characters':{let l=0,best=0;const seen=new Map();for(let r=0;r<a.length;r++){l=Math.max(l,(seen.get(a[r])??-1)+1);seen.set(a[r],r);best=Math.max(best,r-l+1)}return best}
 case 'longest-repeating-character-replacement':{const counts={};let l=0,best=0,max=0;for(let r=0;r<a.length;r++){counts[a[r]]=(counts[a[r]]||0)+1;max=Math.max(max,counts[a[r]]);while(r-l+1-max>b)counts[a[l++]]--;best=Math.max(best,r-l+1)}return best}
 case 'minimum-window-substring':{if(!b)return '';const need={};for(const c of b)need[c]=(need[c]||0)+1;let missing=b.length,l=0,best='';for(let r=0;r<a.length;r++){if((need[a[r]]??0)>0)missing--;need[a[r]]=(need[a[r]]||0)-1;while(!missing){const w=a.slice(l,r+1);if(!best||w.length<best.length)best=w;need[a[l]]++;if(need[a[l++]]>0)missing++}}return best}
 case 'valid-anagram':return [...a].sort().join('')===[...b].sort().join('');
 case 'group-anagrams':{const m=new Map();for(const s of a){const k=[...s].sort().join('');if(!m.has(k))m.set(k,[]);m.get(k).push(s)}return [...m.values()]}
 case 'valid-parentheses':{const st=[],pairs={')':'(',']':'[','}':'{'};for(const c of a)if('([{'.includes(c))st.push(c);else if(st.pop()!==pairs[c])return false;return !st.length}
 case 'valid-palindrome':{const s=a.toLowerCase().replace(/[^a-z0-9]/g,'');return s===[...s].reverse().join('')}
 case 'longest-palindromic-substring':case 'palindromic-substrings':{let best='',count=0;for(let i=0;i<a.length;i++)for(const offset of [0,1])for(let l=i,r=i+offset;l>=0&&r<a.length&&a[l]===a[r];l--,r++){count++;if(r-l+1>best.length)best=a.slice(l,r+1)}return id==='palindromic-substrings'?count:best}
 case 'maximum-depth-of-binary-tree':return depth(tree(a));
 case 'same-tree':return equal(tree(a),tree(b));
 case 'invert-binary-tree':{function inv(r){return r?{val:r.val,left:inv(r.right),right:inv(r.left)}:null}return flat(inv(tree(a)))}
 case 'binary-tree-maximum-path-sum':{let best=-Infinity;function go(r){if(!r)return 0;const l=Math.max(0,go(r.left)),t=Math.max(0,go(r.right));best=Math.max(best,r.val+l+t);return r.val+Math.max(l,t)}go(tree(a));return best}
 case 'binary-tree-level-order-traversal':{const out=[];let q=tree(a)?[tree(a)]:[];while(q.length){out.push(q.map(n=>n.val));q=q.flatMap(n=>[n.left,n.right]).filter(Boolean)}return out}
 case 'serialize-and-deserialize-binary-tree':return flat(tree(a));
 case 'subtree-of-another-tree':{const sub=tree(b);function go(r){return equal(r,sub)||!!r&&(go(r.left)||go(r.right))}return go(tree(a))}
 case 'construct-binary-tree-from-preorder-and-inorder-traversal':{let i=0;const index=new Map(b.map((v,i)=>[v,i]));function go(l,r){if(l>=r)return null;const val=a[i++],m=index.get(val);return {val,left:go(l,m),right:go(m+1,r)}}return flat(go(0,b.length))}
 case 'validate-binary-search-tree':{function valid(r,min,max){return !r||r.val>min&&r.val<max&&valid(r.left,min,r.val)&&valid(r.right,r.val,max)}return valid(tree(a),-Infinity,Infinity)}
 case 'kth-smallest-element-in-a-bst':return traversal(tree(a),'in')[b-1];
 case 'lowest-common-ancestor-of-a-binary-search-tree':{let r=tree(a);while(r){if(b<r.val&&c<r.val)r=r.left;else if(b>r.val&&c>r.val)r=r.right;else return r.val}throw Error('Invalid LCA')}
 case 'implement-trie-prefix-tree':case 'design-add-and-search-words-data-structure':{const words=new Set(),out=[];a.forEach((op,i)=>{const w=b[i];if(op==='insert'||op==='addWord')words.add(w);else out.push(op==='startsWith'?[...words].some(s=>s.startsWith(w)):id==='implement-trie-prefix-tree'?words.has(w):[...words].some(s=>s.length===w.length&&[...w].every((c,j)=>c==='.'||c===s[j]))) });return out}
 case 'top-k-frequent-elements':{const m=new Map();for(const x of a)m.set(x,(m.get(x)||0)+1);return [...m].sort((a,b)=>b[1]-a[1]).slice(0,b).map(([v])=>v)}
 case 'find-median-from-data-stream':{const nums=[],out=[];a.forEach((op,i)=>{if(op==='addNum'){nums.push(b[i]);nums.sort((x,y)=>x-y)}else{const m=nums.length>>1;out.push(nums.length%2?nums[m]:(nums[m-1]+nums[m])/2)}});return out}
 default:throw Error('Missing reference: '+id);
 }
}
