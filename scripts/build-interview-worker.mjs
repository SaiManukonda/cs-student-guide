import {build} from 'esbuild';
await build({entryPoints:['app/interview/ai-worker.ts'],outfile:'public/interview/ai-worker.js',bundle:true,format:'esm',platform:'browser',minify:true,legalComments:'eof'});
