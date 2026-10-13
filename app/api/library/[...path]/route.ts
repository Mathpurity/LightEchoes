import {ApplicationAPI} from '@/lib/application-api';
import {database,bucket} from '@/lib/storage';
import {env} from 'cloudflare:workers';
import type {Configuration} from '@/lib/application-api';
async function handler(req:Request,ctx:{params:Promise<{path:string[]}>}){
 try{const {path}=await ctx.params;const bindings=env as unknown as Configuration;
 const config:Configuration={};for(const key of ['APP_URL','PAYSTACK_SECRET_KEY','PASSWORD_PEPPER','RESEND_API_KEY','MAIL_FROM'] as const)config[key]=bindings[key]||process.env[key];
 return new ApplicationAPI(database(),bucket(),config).handle(req,path.join('/'));}

 catch{return Response.json({message:'The library is being prepared. Please try again shortly.'},{status:503});}
}
export const GET=handler;export const POST=handler;
