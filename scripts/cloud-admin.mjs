import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2),get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1]};
const email=(get('--email','')||'').trim().toLowerCase(),role=get('--role','admin'),configPath=get('--config','dist/server/wrangler.production.json');
if(!/^\S+@\S+\.\S+$/.test(email)||!['admin','member'].includes(role)){console.error('Usage: pnpm cloud:admin --email REGISTERED_EMAIL --role admin|member');process.exit(1)}
const config=JSON.parse(readFileSync(configPath,'utf8'));if(!config.d1_databases?.some(db=>db.binding==='DB'&&db.database_id&&db.database_id!=='00000000-0000-4000-8000-000000000000')){console.error('Prepare the actual Cloudflare database configuration first.');process.exit(1)}
const dir=mkdtempSync(path.join(tmpdir(),'le-admin-')),file=path.join(dir,'role.sql');
// SQLite literals are escaped; no shell interpolation or external commands receive the email.
const escaped=email.replaceAll("'","''");
writeFileSync(file,`UPDATE users SET role='${role}' WHERE email='${escaped}' AND account_status='active'${role==='member'?" AND (role<>'admin' OR (SELECT COUNT(*) FROM users WHERE role='admin' AND account_status='active')>1)":''};\n`);
console.log('Updating a registered account on the configured REMOTE database. Zero changed rows means the account was not found, is inactive, or is the last active administrator.');
try{const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--remote','--config',configPath,'--file',file,'--yes'],{stdio:'inherit'});if(result.error)throw result.error;process.exitCode=result.status??1}finally{rmSync(dir,{recursive:true,force:true})}
