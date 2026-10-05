import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { getCourseImage } from '../utils/courseImages';
export default function ExternalCourseCard({course,index}){
 const image=getCourseImage({title:course.title,category:course.accent});
 return <article className="external-course-card"><div className="external-course-image"><img src={image} alt=""/><span className="external-badge">Udemy</span></div><div className="external-course-body"><div className="eyebrow">{course.category}</div><h3>{course.title}</h3><p>By {course.instructor}</p><div className="external-meta"><span><Star size={14} fill="currentColor"/> {course.rating}</span><span>{course.students} students</span></div><a className="btn ghost full" href={course.url} target="_blank" rel="noreferrer">View on Udemy <ExternalLink size={15}/></a></div></article>;
}
