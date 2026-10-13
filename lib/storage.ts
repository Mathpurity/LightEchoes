import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw Error('Database unavailable');return env.DB;}
export function bucket(){if(!env.BUCKET)throw Error('Storage unavailable');return env.BUCKET;}
