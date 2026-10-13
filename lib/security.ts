const encoder=new TextEncoder();
export const now=()=>Math.floor(Date.now()/1000);
export const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export function equal(a:string,b:string){const x=encoder.encode(a),y=encoder.encode(b);let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0;}
export async function passwordHash(password:string,salt=randomToken(),pepper=''){const key=await crypto.subtle.importKey('raw',encoder.encode(password+pepper),'PBKDF2',false,['deriveBits']);const result=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256);return `${salt}:${Array.from(new Uint8Array(result),b=>b.toString(16).padStart(2,'0')).join('')}`;}
export async function passwordMatches(password:string,stored:string,pepper=''){const [salt]=stored.split(':');return equal(await passwordHash(password,salt,pepper),stored);}
export async function signature(body:string,key:string){const k=await crypto.subtle.importKey('raw',encoder.encode(key),{name:'HMAC',hash:'SHA-512'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',k,encoder.encode(body))),b=>b.toString(16).padStart(2,'0')).join('');}
