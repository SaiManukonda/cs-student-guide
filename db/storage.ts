import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('Workspace storage is unavailable. Please try again.');return env.DB}
