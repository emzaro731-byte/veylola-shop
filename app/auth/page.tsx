"use client";
import {FormEvent,useState} from "react";
import {supabase} from "../../lib/supabase";
export default function Auth(){
 const [login,setLogin]=useState(true),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState(""),[msg,setMsg]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setMsg("");if(!supabase){setMsg("Supabase is not configured.");return}
 const result=login?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password,options:{data:{display_name:name}}});
 if(result.error)setMsg(result.error.message);else setMsg(login?"Signed in successfully.":"Account created. Check your email if confirmation is enabled.");
 }
 return <main className="auth"><form onSubmit={submit}><h1>{login?"Welcome back":"Create your account"}</h1><p>{login?"Sign in to Veylola Shop":"Join Veylola Shop and start shopping."}</p>{!login&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required/>}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" minLength={6} required/><button>{login?"Sign in":"Create account"}</button>{msg&&<small>{msg}</small>}<button type="button" className="link" onClick={()=>setLogin(!login)}>{login?"Create an account":"Already have an account? Sign in"}</button></form></main>
}