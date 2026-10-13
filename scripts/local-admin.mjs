import {createRequire} from 'node:module';
import path from 'node:path';
import {setupLocal,projectRoot} from './local-setup.mjs';
const email=(process.argv[2]||'').trim().toLowerCase();const roleIndex=process.argv.indexOf('--role');const role=roleIndex<0?'admin':process.argv[roleIndex+1];if(!['admin','member'].includes(role)){console.error('Role must be admin or member.');process.exit(1)}
if(!/^\S+@\S+\.\S+$/.test(email)){console.error('Usage: pnpm local:admin your-registered-email@example.com');process.exit(1)}
await setupLocal(projectRoot,{quiet:true});
const require=createRequire(import.meta.url);const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("local admin")}}',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'00000000-0000-4000-8000-000000000000'},d1Persist:path.join(projectRoot,'.wrangler/state/v3/d1')});
try{const db=await mf.getD1Database('DB');const result=await db.prepare("UPDATE users SET role=? WHERE email=? AND account_status='active' AND (?='admin' OR role<>'admin' OR (SELECT COUNT(*) FROM users WHERE role='admin' AND account_status='active')>1)").bind(role,email,role).run();if(!result.meta.changes){console.error('No matching active account, or this is the last active administrator. Register the account first and retain at least one active administrator.');process.exitCode=1}else console.log('Local account role updated. Sign out and sign in again.')}finally{await mf.dispose()}
