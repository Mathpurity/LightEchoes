import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2);const get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1]};
const databaseId=get('--database-id',''),bucket=get('--bucket','lightechoes-books'),databaseName=get('--database-name','lightechoes-db'),name=get('--name','lightechoes-library');
if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(databaseId)||databaseId==='00000000-0000-4000-8000-000000000000'){console.error('Pass the actual Cloudflare D1 database ID: pnpm prepare:cloudflare --database-id YOUR_D1_ID');process.exit(1)}
if(!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)||!name||!databaseName){console.error('Use a valid R2 bucket name, Worker name and database name.');process.exit(1)}
const base='dist/server/wrangler.json';if(!existsSync(base)){console.error('Run pnpm build first.');process.exit(1)}
const built=JSON.parse(readFileSync(base,'utf8'));
const config={name,main:built.main,compatibility_date:built.compatibility_date,compatibility_flags:built.compatibility_flags,no_bundle:true,rules:built.rules,assets:built.assets,d1_databases:[{binding:'DB',database_name:databaseName,database_id:databaseId,migrations_dir:path.resolve('drizzle')}],r2_buckets:[{binding:'BUCKET',bucket_name:bucket}],observability:{enabled:true},workers_dev:true};
writeFileSync('dist/server/wrangler.production.json',JSON.stringify(config,null,2)+'\n');
console.log('Cloudflare configuration prepared at dist/server/wrangler.production.json. No deployment or remote changes were made. Re-run this command after every build.');
