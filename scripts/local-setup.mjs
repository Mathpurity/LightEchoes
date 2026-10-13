import {readFileSync,writeFileSync,existsSync,readdirSync,mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {parseEnv} from 'node:util';
export const projectRoot=fileURLToPath(new URL('../',import.meta.url));
const databaseId='00000000-0000-4000-8000-000000000000';
export function ensureLocalEnvironment(root=projectRoot){
 const files=['.env','.env.local','.dev.vars'];const values={};
 for(const name of files){const file=path.join(root,name);if(existsSync(file)){for(const [key,value] of Object.entries(parseEnv(readFileSync(file,'utf8'))))if(value.trim())values[key]=value}}
 const file=path.join(root,'.dev.vars');let text=existsSync(file)?readFileSync(file,'utf8'):'';
 const updates={PASSWORD_PEPPER:values.PASSWORD_PEPPER||randomBytes(32).toString('hex'),APP_URL:values.APP_URL&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(values.APP_URL)?values.APP_URL:'http://localhost:5173'};
 for(const [key,value] of Object.entries(updates)){
  if(new RegExp('^'+key+'\\s*=','m').test(text))text=text.replace(new RegExp('^'+key+'\\s*=.*$','m'),key+'='+value);
  else text+=(text&&!text.endsWith('\n')?'\n':'')+key+'='+value+'\n';
 }
 // Only copy service settings into this private development file. Never print secrets.
 for(const key of ['PAYSTACK_SECRET_KEY','RESEND_API_KEY','MAIL_FROM'])if(values[key]&&!new RegExp('^'+key+'\\s*=','m').test(text))text+=key+'='+JSON.stringify(values[key])+'\n';
 if(!existsSync(file)||readFileSync(file,'utf8')!==text)writeFileSync(file,text,{mode:0o600});
 return updates;
}
export async function setupLocal(root=projectRoot,{quiet=false}={}){
 ensureLocalEnvironment(root);
 const require=createRequire(import.meta.url);const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
 const state=path.join(root,'.wrangler','state','v3');mkdirSync(state,{recursive:true});
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("local setup")}}',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:databaseId},d1Persist:path.join(state,'d1')});
 try{
  const db=await mf.getD1Database('DB');
  for(const name of readdirSync(path.join(root,'drizzle')).filter(x=>/^\d+.*\.sql$/.test(x)).sort()){
   const statements=readFileSync(path.join(root,'drizzle',name),'utf8').split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean);
   for(let sql of statements){
    const alter=sql.match(/^ALTER TABLE `([^`]+)` ADD `([^`]+)`/i);
    if(alter){const columns=(await db.prepare('PRAGMA table_info(`'+alter[1]+'`)').all()).results;if(columns.some(x=>x.name===alter[2]))continue}
    else sql=sql.replace(/^CREATE TABLE /i,'CREATE TABLE IF NOT EXISTS ').replace(/^CREATE (UNIQUE )?INDEX /i,(_,unique)=>'CREATE '+(unique||'')+'INDEX IF NOT EXISTS ');
    await db.prepare(sql).run();
   }
  }
  if(!quiet)console.log('Local setup complete. Existing accounts and books were preserved. Run pnpm dev.');
 }finally{await mf.dispose()}
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){setupLocal().catch(error=>{console.error('Local setup failed:',error.message);process.exitCode=1})}
