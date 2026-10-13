export type AuthMode='register'|'login'|'forgot'|'reset';
export type AuthValues={name?:string;email?:string;password?:string;confirmPassword?:string;terms?:boolean};
export function validateAuth(mode:AuthMode,values:AuthValues):Record<string,string>{
 const errors:Record<string,string>={};
 if(mode==='register'&&(!values.name?.trim()||values.name.trim().length>120))errors.name='Enter your full name (up to 120 characters).';
 if(mode!=='reset'&&(!values.email?.trim()||values.email.trim().length>254||!/^\S+@\S+\.\S+$/.test(values.email.trim())))errors.email='Enter a valid email address.';
 if(mode!=='forgot'){
  if(!values.password)errors.password='Enter your password.';
  else if(values.password.length>256)errors.password='Your password must be no more than 256 characters.';
  else if((mode==='register'||mode==='reset')&&values.password.length<12)errors.password='Use a password of at least 12 characters.';
 }
 if(mode==='register'||mode==='reset'){
  if(!values.confirmPassword)errors.confirmPassword='Confirm your password.';
  else if(values.password!==values.confirmPassword)errors.confirmPassword='Your passwords do not match. Please enter the same password in both fields.';
 }
 if(mode==='register'&&!values.terms)errors.terms='Read and accept the purchase terms and privacy information to continue.';
 return errors;
}
