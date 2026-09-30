// These helpers are sent to the remote sandbox. Submitted code is never evaluated by the app server.
export const jsRuntime = String.raw`
class ListNode { constructor(val=0,next=null){this.val=val;this.next=next;} }
class TreeNode { constructor(val=0,left=null,right=null){this.val=val;this.left=left;this.right=right;} }
class Node { constructor(val=0,neighbors=[]){this.val=val;this.neighbors=neighbors;} }
function list(a,pos=-1){const ns=a.map(x=>new ListNode(x));ns.forEach((n,i)=>n.next=ns[i+1]||null);if(pos>=0&&ns.length)ns.at(-1).next=ns[pos];return ns[0]||null;}
function tree(a){if(!a.length||a[0]===null)return null;const root=new TreeNode(a[0]),q=[root];let i=1;for(let k=0;k<q.length&&i<a.length;k++){for(const key of ['left','right'])if(i<a.length){const v=a[i++];if(v!==null){q[k][key]=new TreeNode(v);q.push(q[k][key]);}}}return root;}
function graph(a){const ns=a.map((_,i)=>new Node(i+1));ns.forEach((n,i)=>n.neighbors=a[i].map(v=>ns[v-1]));return ns[0]||null;}
function pack(v,kind){if(kind==='list'){const a=[],seen=new Set();while(v){if(seen.has(v)||a.length>10000)throw Error('Returned list contains a cycle or is too large');seen.add(v);a.push(v.val);v=v.next;}return a;}
if(kind==='tree'){if(!v)return [];const a=[],q=[v],seen=new Set();for(let i=0;i<q.length;i++){const n=q[i];if(!n){a.push(null);continue;}if(seen.has(n)||q.length>10000)throw Error('Invalid returned tree');seen.add(n);a.push(n.val);q.push(n.left,n.right);}while(a.at(-1)===null)a.pop();return a;}
if(kind==='graph'){if(!v)return [];const q=[v],seen=new Set([v]),a=[];for(let i=0;i<q.length;i++){const n=q[i];if(q.length>10000)throw Error('Graph too large');a[n.val-1]=n.neighbors.map(x=>x.val);for(const c of n.neighbors)if(!seen.has(c)){seen.add(c);q.push(c);}}return a;}return v;}
function assertClone(a,b){const orig=new Set(),q=a?[a]:[];for(let i=0;i<q.length;i++){const n=q[i];if(orig.has(n))continue;orig.add(n);q.push(...n.neighbors);}const seen=new Set(),r=b?[b]:[];for(let i=0;i<r.length;i++){const n=r[i];if(orig.has(n))throw Error('Return a deep copy, not original nodes');if(seen.has(n))continue;seen.add(n);if(seen.size>10000)throw Error('Graph too large');r.push(...n.neighbors);}}
`;
export const pyRuntime = String.raw`
from __future__ import annotations
import json, collections, heapq, math
from typing import Optional
class ListNode:
    def __init__(self, val=0, next=None): self.val, self.next = val, next
class TreeNode:
    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right
class Node:
    def __init__(self, val=0, neighbors=None): self.val, self.neighbors = val, neighbors or []
def make_list(a, pos=-1):
    ns = [ListNode(x) for x in a]
    for i in range(len(ns)-1): ns[i].next = ns[i+1]
    if ns and pos >= 0: ns[-1].next = ns[pos]
    return ns[0] if ns else None
def tree(a):
    if not a or a[0] is None: return None
    root=TreeNode(a[0]); q=[root]; i=1
    for n in q:
        for key in ('left','right'):
            if i < len(a):
                v=a[i]; i+=1
                if v is not None:
                    child=TreeNode(v); setattr(n,key,child); q.append(child)
    return root
def graph(a):
    ns=[Node(i+1) for i in range(len(a))]
    for i,n in enumerate(ns): n.neighbors=[ns[v-1] for v in a[i]]
    return ns[0] if ns else None
def pack(v,kind):
    if kind=='list':
        a=[]; seen=set()
        while v:
            if id(v) in seen or len(a)>10000: raise ValueError('Returned list contains a cycle or is too large')
            seen.add(id(v)); a.append(v.val); v=v.next
        return a
    if kind=='tree':
        if v is None: return []
        a=[]; q=[v]; seen=set()
        for n in q:
            if n is None: a.append(None); continue
            if id(n) in seen or len(q)>10000: raise ValueError('Invalid returned tree')
            seen.add(id(n)); a.append(n.val); q.extend([n.left,n.right])
        while a and a[-1] is None: a.pop()
        return a
    if kind=='graph':
        if v is None: return []
        q=[v]; seen={id(v)}; rows={}
        for n in q:
            if len(q)>10000: raise ValueError('Graph too large')
            rows[n.val]=[c.val for c in n.neighbors]
            for c in n.neighbors:
                if id(c) not in seen: seen.add(id(c)); q.append(c)
        return [rows[i] for i in range(1,len(rows)+1)]
    return v
def assert_clone(a,b):
    orig=set(); q=[a] if a else []
    for n in q:
        if id(n) in orig: continue
        orig.add(id(n)); q.extend(n.neighbors)
    seen=set(); q=[b] if b else []
    for n in q:
        if id(n) in orig: raise ValueError('Return a deep copy, not original nodes')
        if id(n) in seen: continue
        seen.add(id(n))
        if len(seen)>10000: raise ValueError('Graph too large')
        q.extend(n.neighbors)
`;
export const javaRuntime = String.raw`
class ListNode { int val; ListNode next; ListNode(){this(0);} ListNode(int v){val=v;} ListNode(int v,ListNode n){val=v;next=n;} }
class TreeNode { int val; TreeNode left,right; TreeNode(){this(0);} TreeNode(int v){val=v;} TreeNode(int v,TreeNode l,TreeNode r){val=v;left=l;right=r;} }
class Node { public int val; public List<Node> neighbors; Node(){this(0);} Node(int v){val=v;neighbors=new ArrayList<>();} Node(int v,List<Node> n){val=v;neighbors=n;} }
class Helpers {
 static ListNode list(int[] a,int pos){ListNode[] ns=new ListNode[a.length];for(int i=0;i<a.length;i++)ns[i]=new ListNode(a[i]);for(int i=0;i+1<a.length;i++)ns[i].next=ns[i+1];if(pos>=0&&a.length>0)ns[a.length-1].next=ns[pos];return a.length==0?null:ns[0];}
 static TreeNode tree(Integer[] a){if(a.length==0||a[0]==null)return null;TreeNode root=new TreeNode(a[0]);List<TreeNode> q=new ArrayList<>();q.add(root);int i=1;for(int k=0;k<q.size()&&i<a.length;k++){TreeNode n=q.get(k);if(a[i]!=null){n.left=new TreeNode(a[i]);q.add(n.left);}i++;if(i<a.length){if(a[i]!=null){n.right=new TreeNode(a[i]);q.add(n.right);}i++;}}return root;}
 static Node graph(int[][] a){Node[] ns=new Node[a.length];for(int i=0;i<a.length;i++)ns[i]=new Node(i+1);for(int i=0;i<a.length;i++)for(int v:a[i])ns[i].neighbors.add(ns[v-1]);return a.length==0?null:ns[0];}
 static void assertClone(Node a,Node b){Set<Node> orig=Collections.newSetFromMap(new IdentityHashMap<>());List<Node> q=new ArrayList<>();if(a!=null)q.add(a);for(int i=0;i<q.size();i++){Node n=q.get(i);if(orig.add(n))q.addAll(n.neighbors);}Set<Node> seen=Collections.newSetFromMap(new IdentityHashMap<>());q.clear();if(b!=null)q.add(b);for(int i=0;i<q.size();i++){Node n=q.get(i);if(orig.contains(n))throw new IllegalArgumentException("Return a deep copy, not original nodes");if(seen.add(n))q.addAll(n.neighbors);if(seen.size()>10000)throw new IllegalArgumentException("Graph too large");}}
 static Object pack(Object v,String kind){
  if(kind.equals("list")){List<Integer>a=new ArrayList<>();Set<ListNode>seen=Collections.newSetFromMap(new IdentityHashMap<>());for(ListNode n=(ListNode)v;n!=null;n=n.next){if(!seen.add(n)||a.size()>10000)throw new IllegalArgumentException("Returned list contains a cycle or is too large");a.add(n.val);}return a;}
  if(kind.equals("tree")){List<Integer>a=new ArrayList<>();if(v==null)return a;List<TreeNode>q=new ArrayList<>();q.add((TreeNode)v);Set<TreeNode>seen=Collections.newSetFromMap(new IdentityHashMap<>());for(int i=0;i<q.size();i++){TreeNode n=q.get(i);if(n==null){a.add(null);continue;}if(!seen.add(n)||q.size()>10000)throw new IllegalArgumentException("Invalid returned tree");a.add(n.val);q.add(n.left);q.add(n.right);}while(!a.isEmpty()&&a.get(a.size()-1)==null)a.remove(a.size()-1);return a;}
  if(kind.equals("graph")){List<List<Integer>>out=new ArrayList<>();if(v==null)return out;List<Node>q=new ArrayList<>();q.add((Node)v);Set<Node>seen=Collections.newSetFromMap(new IdentityHashMap<>());seen.add((Node)v);TreeMap<Integer,List<Integer>> rows=new TreeMap<>();for(int i=0;i<q.size();i++){Node n=q.get(i);if(q.size()>10000)throw new IllegalArgumentException("Graph too large");List<Integer>row=new ArrayList<>();for(Node c:n.neighbors){row.add(c.val);if(seen.add(c))q.add(c);}rows.put(n.val,row);}for(int i=1;i<=rows.size();i++){if(!rows.containsKey(i))throw new IllegalArgumentException("Invalid graph labels");out.add(rows.get(i));}return out;}
  return v;
 }
 static String json(Object o){if(o==null)return "null";if(o instanceof String){String s=(String)o;StringBuilder b=new StringBuilder("\"");for(char c:s.toCharArray()){switch(c){case '"':b.append("\\\"");break;case '\\':b.append("\\\\");break;case '\n':b.append("\\n");break;case '\r':b.append("\\r");break;case '\t':b.append("\\t");break;default:if(c<32)b.append(String.format("\\u%04x",(int)c));else b.append(c);}}return b.append('"').toString();}if(o instanceof Number||o instanceof Boolean)return o.toString();List<String>parts=new ArrayList<>();if(o.getClass().isArray()){for(int i=0;i<java.lang.reflect.Array.getLength(o);i++)parts.add(json(java.lang.reflect.Array.get(o,i)));}else if(o instanceof Iterable<?>){for(Object v:(Iterable<?>)o)parts.add(json(v));}else throw new IllegalArgumentException("Unsupported return type");return "["+String.join(",",parts)+"]";}
}
`;
export const cppRuntime = String.raw`
struct ListNode {int val; ListNode* next; ListNode(int v=0,ListNode* n=nullptr):val(v),next(n){} };
struct TreeNode {int val; TreeNode *left,*right; TreeNode(int v=0,TreeNode* l=nullptr,TreeNode* r=nullptr):val(v),left(l),right(r){} };
struct Node {int val; vector<Node*> neighbors; Node(int v=0):val(v){} Node(int v,vector<Node*> n):val(v),neighbors(n){} };
namespace Harness {
ListNode* list(vector<int>a,int pos=-1){vector<ListNode*> ns;for(int v:a)ns.push_back(new ListNode(v));for(size_t i=0;i+1<ns.size();i++)ns[i]->next=ns[i+1];if(pos>=0&&!ns.empty())ns.back()->next=ns[pos];return ns.empty()?nullptr:ns[0];}
TreeNode* tree(vector<long long>a){const long long nil=2147483648LL;if(a.empty()||a[0]==nil)return nullptr;auto root=new TreeNode(a[0]);vector<TreeNode*>q{root};size_t i=1;for(size_t k=0;k<q.size()&&i<a.size();k++){auto n=q[k];if(a[i]!=nil){n->left=new TreeNode(a[i]);q.push_back(n->left);}i++;if(i<a.size()){if(a[i]!=nil){n->right=new TreeNode(a[i]);q.push_back(n->right);}i++;}}return root;}
Node* graph(vector<vector<int>>a){vector<Node*>ns;for(size_t i=0;i<a.size();i++)ns.push_back(new Node(i+1));for(size_t i=0;i<a.size();i++)for(int v:a[i])ns[i]->neighbors.push_back(ns[v-1]);return ns.empty()?nullptr:ns[0];}
void assertClone(Node*a,Node*b){unordered_set<Node*>orig,seen;vector<Node*>q;if(a)q.push_back(a);for(size_t i=0;i<q.size();i++)if(orig.insert(q[i]).second)for(auto c:q[i]->neighbors)q.push_back(c);q.clear();if(b)q.push_back(b);for(size_t i=0;i<q.size();i++){auto n=q[i];if(orig.count(n))throw runtime_error("Return a deep copy, not original nodes");if(seen.insert(n).second)for(auto c:n->neighbors)q.push_back(c);if(seen.size()>10000)throw runtime_error("Graph too large");}}
string json(const string&s){string r="\"";const char*hex="0123456789abcdef";for(unsigned char c:s){if(c=='"'||c=='\\'){r+='\\';r+=c;}else if(c<32){r+="\\u00";r+=hex[c>>4];r+=hex[c&15];}else r+=c;}return r+'"';}
string json(bool v){return v?"true":"false";}
string json(int v){return to_string(v);} string json(long long v){return to_string(v);} string json(unsigned int v){return to_string(v);} string json(double v){if(!isfinite(v))throw runtime_error("Return a finite number");ostringstream s;s<<setprecision(17)<<v;return s.str();}
template<class T>string json(const vector<T>&a){string r="[";for(size_t i=0;i<a.size();i++){if(i)r+=',';r+=json(a[i]);}return r+"]";}
string json(ListNode*n){vector<int>a;unordered_set<ListNode*>seen;while(n){if(!seen.insert(n).second||a.size()>10000)throw runtime_error("Returned list contains a cycle or is too large");a.push_back(n->val);n=n->next;}return json(a);}
string json(TreeNode*n){if(!n)return "[]";vector<TreeNode*>q{n};vector<string>a;unordered_set<TreeNode*>seen;for(size_t i=0;i<q.size();i++){auto v=q[i];if(!v){a.push_back("null");continue;}if(!seen.insert(v).second||q.size()>10000)throw runtime_error("Invalid returned tree");a.push_back(to_string(v->val));q.push_back(v->left);q.push_back(v->right);}while(!a.empty()&&a.back()=="null")a.pop_back();string r="[";for(size_t i=0;i<a.size();i++){if(i)r+=',';r+=a[i];}return r+"]";}
string json(Node*n){if(!n)return "[]";vector<Node*>q{n};unordered_set<Node*>seen{n};map<int,vector<int>>rows;for(size_t i=0;i<q.size();i++){auto v=q[i];if(q.size()>10000)throw runtime_error("Graph too large");rows[v->val]={};for(auto c:v->neighbors){rows[v->val].push_back(c->val);if(seen.insert(c).second)q.push_back(c);}}vector<vector<int>>a;for(size_t i=1;i<=rows.size();i++){if(!rows.count(i))throw runtime_error("Invalid graph labels");a.push_back(rows[i]);}return json(a);}
}
`;
