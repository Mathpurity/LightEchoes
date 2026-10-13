import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {parseEnv} from 'node:util';
import {setupLocal,ensureLocalEnvironment} from '../scripts/local-setup.mjs';
const root=mkdtempSync(path.join(tmpdir(),'le-local-setup-'));
cpSync('drizzle',path.join(root,'drizzle'),{recursive:true});
writeFileSync(path.join(root,'.env.local'),'APP_URL=https://your-domain.com\nPASSWORD_PEPPER=\n');
await setupLocal(root,{quiet:true});
const settings=parseEnv(readFileSync(path.join(root,'.dev.vars'),'utf8'));assert.equal(settings.APP_URL,'http://localhost:5173');assert.match(settings.PASSWORD_PEPPER,/^[a-f0-9]{64}$/);
const require=createRequire(import.meta.url);const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
async function database(fn){const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'00000000-0000-4000-8000-000000000000'},d1Persist:path.join(root,'.wrangler/state/v3/d1')});try{return await fn(await mf.getD1Database('DB'))}finally{await mf.dispose()}}
await database(db=>db.prepare("INSERT INTO users (id,email,name,password_hash,role,created_at) VALUES ('keep','keep@example.com','Existing Reader','hash','member',1)").run());
await setupLocal(root,{quiet:true});assert.equal(parseEnv(readFileSync(path.join(root,'.dev.vars'),'utf8')).PASSWORD_PEPPER,settings.PASSWORD_PEPPER);
await database(async db=>{assert.equal((await db.prepare("SELECT name FROM users WHERE id='keep'").first()).name,'Existing Reader');const columns=(await db.prepare('PRAGMA table_info(users)').all()).results;assert.ok(columns.some(x=>x.name==='preferences'));assert.ok(columns.some(x=>x.name==='account_status'))});
const explicit=mkdtempSync(path.join(tmpdir(),'le-local-secret-'));writeFileSync(path.join(explicit,'.env.local'),'PASSWORD_PEPPER=existing-secret-value\nAPP_URL=http://localhost:5173\n');ensureLocalEnvironment(explicit);assert.equal(parseEnv(readFileSync(path.join(explicit,'.dev.vars'),'utf8')).PASSWORD_PEPPER,'existing-secret-value');
console.log('PASS: local settings, placeholder origin repair, shared persistent database initialization, repeatable migrations and preservation of existing accounts/password secret.');
