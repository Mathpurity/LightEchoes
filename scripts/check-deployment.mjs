import {readFileSync,existsSync} from 'node:fs';
import {parseEnv} from 'node:util';
import path from 'node:path';
const index=process.argv.indexOf('--env-file');
const source=index>=0?process.argv[index+1]:null;
if(index>=0&&!source){console.error('Supply a private environment file after --env-file.');process.exit(1)}
const values={...(source?parseEnv(readFileSync(path.resolve(source),'utf8')):{}),...process.env};
const checks=[];const add=(name,ok)=>checks.push({name,ok:!!ok});
let url;try{url=new URL(values.APP_URL)}catch{}
add('Public HTTPS application URL',url&&url.protocol==='https:'&&!['localhost','127.0.0.1','your-domain.com'].includes(url.hostname)&&url.pathname==='/'&&!url.search&&!url.hash&&!url.username&&!url.password);
add('Stable password secret (64 hexadecimal characters)',/^[a-f0-9]{64}$/i.test(values.PASSWORD_PEPPER||''));
add('Paystack secret key',/^sk_(test|live)_[a-z0-9]+$/i.test(values.PAYSTACK_SECRET_KEY||''));
add('Resend API key',/^re_\S+$/.test(values.RESEND_API_KEY||''));
add('Sender address',/^[^<>\r\n]*<?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>?$/.test(values.MAIL_FROM||''));
add('Built Worker',existsSync('dist/server/wrangler.json'));
add('Verification migration',existsSync('drizzle/0002_eminent_karnak.sql'));
for(const check of checks)console.log((check.ok?'PASS':'MISSING')+': '+check.name);
console.log('Paystack mode: '+(values.PAYSTACK_SECRET_KEY?.startsWith('sk_live_')?'LIVE':'TEST / not configured'));
console.log('No secrets were printed. Provider delivery, domain verification, database/storage bindings, support terms, webhook delivery and backup restoration still need hosted acceptance checks.');
if(checks.some(c=>!c.ok))process.exitCode=1;
