import React,{useEffect,useState} from 'react';
import { Award, ArrowLeft, Printer } from 'lucide-react';
import { Link,useParams } from 'react-router-dom';
import { API } from '../api';
export default function Certificate(){
 const {id}=useParams();const [course,setCourse]=useState(null);const [user,setUser]=useState(null);const [ok,setOk]=useState(false);
 useEffect(()=>{Promise.all([API.get('/my/learning'),API.get('/auth/me')]).then(([l,m])=>{const x=l.data.learning.find(x=>x.course._id===id);if(x&&x.percentage===100){setCourse(x.course);setUser(m.data.user);setOk(true);}}).catch(()=>{});},[id]);
 if(!course||!ok)return <div className="state-card page"><h2>Certificate unavailable</h2><p>Complete every lesson in this course first.</p><Link className="btn ghost" to={`/courses/${id}`}>Back to course</Link></div>;
 return <div className="page certificate-page"><div className="container"><div className="certificate"><div className="certificate-border"><Award size={44}/><div className="eyebrow">LEARNY CERTIFICATE OF COMPLETION</div><h1>{user.name}</h1><p>has successfully completed</p><h2>{course.title}</h2><span>Instructor: {course.instructor?.name}</span><div className="certificate-footer"><b>Learny</b><small>Issued {new Date().toLocaleDateString()}</small></div></div></div><div className="certificate-actions"><Link className="btn ghost" to={`/courses/${id}`}><ArrowLeft size={16}/> Back</Link><button className="btn primary" onClick={()=>window.print()}><Printer size={16}/> Print certificate</button></div></div></div>;
}
