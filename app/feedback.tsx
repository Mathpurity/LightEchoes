'use client';
import {useEffect,useRef,useState,useId} from 'react';
import {BookOpen,CheckCircle2,TriangleAlert,Info,X} from 'lucide-react';
export function BookLoader({message='Preparing your next chapter…'}:{message?:string}){return <div className="book-loader" role="status" aria-live="polite"><div className="loader-book" aria-hidden="true"><BookOpen size={54} strokeWidth={1.4}/><span/><span/><span/></div><strong>{message}</strong><small>LIGHTECHOES DIGITAL LIBRARY</small></div>}
export function FeedbackDialog({message,onClose,kind,title,buttonLabel}:{message:string;onClose:()=>void;kind?:'success'|'error'|'info';title?:string;buttonLabel?:string}){
 const ref=useRef<HTMLDialogElement>(null),labelId=useId(),descriptionId=useId();
 useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(message&&!dialog.open)dialog.showModal();else if(!message&&dialog.open)dialog.close()},[message]);
 useEffect(()=>{const dialog=ref.current;return()=>{if(dialog?.open)dialog.close()}},[]);
 const state=kind||(/saved|success|verified|sent|uploaded|upload complete/i.test(message)&&!/failed|not |unavailable|unable/i.test(message)?'success':'error');
 const Icon=state==='success'?CheckCircle2:state==='info'?Info:TriangleAlert;
 return <dialog className={'feedback-dialog '+state} ref={ref} onCancel={e=>{e.preventDefault();onClose()}} aria-labelledby={labelId} aria-describedby={descriptionId}>
  <button type="button" className="dialog-close" onClick={onClose} aria-label="Close message"><X size={20}/></button>
  <div className="dialog-symbol"><Icon size={34}/></div><p className="eyebrow">LIGHTECHOES</p>
  <h2 id={labelId}>{title||(state==='success'?'All set':state==='info'?'A quick update':'Let’s resolve this')}</h2>
  <p id={descriptionId}>{message}</p><button type="button" className="button" autoFocus onClick={onClose}>{buttonLabel||(state==='success'?'Continue':'Got it')}</button>
 </dialog>
}
export function StatusMessage({message}:{message:string}){const [dialog,setDialog]=useState(message);useEffect(()=>setDialog(message),[message]);return <><p role="status">{message}</p><FeedbackDialog message={dialog} onClose={()=>setDialog('')}/></>}
