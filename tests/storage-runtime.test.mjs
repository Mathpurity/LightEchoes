import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'test'},r2Buckets:['BUCKET']});
try{
 const db=await mf.getD1Database('DB');
 const statements=fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort().map(f=>fs.readFileSync('drizzle/'+f,'utf8')).join('\n--> statement-breakpoint\n').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
 await db.batch(statements.map(s=>db.prepare(s)));
 const row=await db.prepare("SELECT datetime('2026-10-31','+4 months','floor') d").first();
 assert.equal(row.d,'2027-02-28 00:00:00');
 const bucket=await mf.getR2Bucket('BUCKET');await bucket.put('publications/test.pdf','%PDF-test',{httpMetadata:{contentType:'application/pdf'}});assert.equal(await (await bucket.get('publications/test.pdf')).text(),'%PDF-test');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'le-d1-tests-'));
 const compile=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','lib/application-api.ts','lib/security.ts','--outDir',temp,'--module','commonjs','--target','es2022','--skipLibCheck','--types','node,@cloudflare/workers-types'],{encoding:'utf8'});
 assert.equal(compile.status,0,compile.stdout+compile.stderr);
 const {ApplicationAPI}=require(path.join(temp,'application-api.js'));
 let verificationMail='';
 const api=new ApplicationAPI(db,bucket,{APP_URL:'https://runtime.test',PASSWORD_PEPPER:'runtime-test-pepper',PAYSTACK_SECRET_KEY:'runtime-test',RESEND_API_KEY:'runtime-mail',MAIL_FROM:'support@runtime.test'},async(url,options)=>{if(url==='https://api.resend.com/emails'){verificationMail=JSON.parse(options.body).text;return Response.json({id:'mail'})}return Response.json({status:true,data:{reference:'TEST-PAY',status:'success',amount:100000,currency:'NGN',customer:{email:'runtime@example.com'}}})});
 async function call(endpoint,body,cookie='',session=''){
  const get=['library','membership','reader/document'].includes(endpoint)||endpoint.startsWith('reader/page-image');
  return api.handle(new Request('https://runtime.test/api/library/'+endpoint,{method:get?'GET':'POST',headers:{origin:'https://runtime.test',cookie,'Content-Type':'application/json','X-LE-Session':session},body:get?undefined:JSON.stringify(body||{})}),endpoint.split('?')[0]);
 }
 assert.equal((await call('auth/register',{name:'Runtime Reader',email:'runtime@example.com',password:'runtime-password-test'})).status,201);
 const login=await call('auth/login',{email:'runtime@example.com',password:'runtime-password-test'});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
 const user=await db.prepare('SELECT id FROM users WHERE email=?').bind('runtime@example.com').first();
 assert.equal((await call('auth/verify-email',{token:verificationMail.match(/token=([a-f0-9]+)/)[1]})).status,200);assert.ok((await db.prepare('SELECT email_verified_at FROM users WHERE id=?').bind(user.id).first()).email_verified_at);
 const timestamp=Math.floor(Date.now()/1000);
 await db.prepare("INSERT INTO publications (id,publication_code,title,author,status,r2_object,page_count,created_at,price_kobo,page_keys) VALUES ('book','TEST-BOOK','Test book','Test author','published','publications/test.pdf',10,?,100000,'[\"pages/test.png\"]')").bind(timestamp).run();
 await db.prepare("INSERT INTO payments (reference,user_id,email,amount,currency,status,credited,created_at,publication_id,access_months) VALUES ('TEST-PAY',?,'runtime@example.com',100000,'NGN','pending',0,?,'book',4)").bind(user.id,timestamp).run();
 const paid=await call('payment/verify',{reference:'TEST-PAY'},cookie);assert.equal(paid.status,200,await paid.text());
 const expiry=await db.prepare('SELECT expires_at FROM licences WHERE user_id=?').bind(user.id).first();assert.ok(expiry.expires_at>timestamp);
 assert.equal((await call('payment/verify',{reference:'TEST-PAY'},cookie)).status,200);
 assert.deepEqual(await db.prepare('SELECT expires_at FROM licences WHERE user_id=?').bind(user.id).first(),expiry);
 const library=await call('library',null,cookie);assert.equal(library.status,200);assert.equal((await library.json()).length,1);
 const opened=await call('reader/session',{publicationId:'book'},cookie);assert.equal(opened.status,200);const session=(await opened.json()).session;
 await bucket.put('pages/test.png','test-page',{httpMetadata:{contentType:'image/png'}});assert.equal((await call('reader/document',null,cookie,session)).status,410);assert.equal((await call('reader/page-image?page=1',null,cookie,session)).status,200);
 console.log('PASS: actual local D1 payment credit/replay, licence grant and R2-backed authorized reader.');
 console.log('PASS: actual local D1 migration, month-end SQLite support and R2 private binding upload/retrieval');
}finally{await mf.dispose()}
