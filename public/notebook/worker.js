// Pinned browser Python runtime; packages execute locally in this worker.
const root='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
let python,boot,execution=0;
const helpers=`
import ast as _ast, io as _io, json as _json, contextlib as _contextlib, traceback as _traceback
import pandas as _pd, numpy as _np
_outputs = []
def _capture(value):
    if value is None:
        return
    if isinstance(value, _pd.Series):
        value = value.to_frame()
    if isinstance(value, _pd.DataFrame):
        frame = value.iloc[:50, :20]
        _outputs.append({"kind": "table", "columns": [str(value.index.name or "index")] + [str(c)[:200] for c in frame.columns], "rows": [[str(i)[:500]] + [str(v)[:500] for v in row] for i, row in zip(frame.index, frame.itertuples(index=False, name=None))], "total": len(value)})
    elif isinstance(value, _np.ndarray):
        _outputs.append({"kind": "text", "text": _np.array2string(value, threshold=100)[:20000]})
    else:
        _outputs.append({"kind": "text", "text": repr(value)[:20000]})
def _download_file(name, data):
    import base64, re
    if not isinstance(data, bytes) or len(data) > 1000000:
        raise ValueError("Downloads must be bytes under 1 MB")
    if not re.fullmatch(r"[a-zA-Z0-9_-]+[.]zip", name):
        raise ValueError("Use a simple .zip filename")
    _outputs.append({"kind": "file", "name": name, "base64": base64.b64encode(data).decode("ascii")})
_scope = {"__name__": "__main__", "display": _capture, "download_file": _download_file}
def _run_cell(source, check):
    global _outputs
    _outputs = []
    stream = _io.StringIO()
    error = None
    check_error = None
    with _contextlib.redirect_stdout(stream), _contextlib.redirect_stderr(stream):
        try:
            tree = _ast.parse(source, filename="notebook-cell")
            final = tree.body.pop() if tree.body and isinstance(tree.body[-1], _ast.Expr) else None
            exec(compile(tree, "notebook-cell", "exec"), _scope)
            if final:
                _capture(eval(compile(_ast.Expression(final.value), "notebook-cell", "eval"), _scope))
        except Exception:
            error = _traceback.format_exc(limit=4)[-6000:]
    text = stream.getvalue()[:20000]
    if text:
        _outputs.insert(0, {"kind": "text", "text": text})
    if not error and check:
        try:
            exec(check, _scope)
        except Exception as exc:
            check_error = str(exc)[:1000]
    return _json.dumps({"outputs": _outputs[:15], "error": error, "checkError": check_error})
`;
async function ready(packages){
 if(!boot)boot=(async()=>{postMessage({type:'status',message:'Loading Python…'});const {loadPyodide}=await import(root+'pyodide.mjs');python=await loadPyodide({indexURL:root});postMessage({type:'status',message:'Loading notebook packages…'});await python.loadPackage(['numpy','pandas',...['scikit-learn','pyyaml'].filter(p=>packages?.includes(p))]);await python.runPythonAsync(helpers);postMessage({type:'ready'});})();
 return boot;
}
let chain=Promise.resolve();
self.onmessage=({data})=>{chain=chain.then(async()=>{
 const {id,source,check}=data;
 try{
  await ready(data.packages);if(data.type==='init')return;
  if(typeof source!=='string'||source.length>20000||typeof check!=='string'||check.length>5000)throw Error('Invalid cell request.');
  const fn=python.globals.get('_run_cell');let result;
  try{result=JSON.parse(fn(source,check));}finally{fn.destroy();}
  postMessage({type:'result',id,execution:++execution,...result});
 }catch(error){postMessage({type:'fatal',id,message:String(error?.message||error).slice(0,3000)});}
});};
