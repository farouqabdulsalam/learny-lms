import React from 'react';
import { ArrowUpRight, Clock3, LockKeyhole, PlayCircle, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { getCourseImage } from '../utils/courseImages';

const gradients = ['g1', 'g2', 'g3', 'g4', 'g5'];
export default function CourseCard({ course, index = 0, progress }) {
  const minutes = course.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
  return (
    <Link to={`/courses/${course._id}`} className="course-card">
      <div className={`course-cover ${gradients[index % gradients.length]}`}>
        <img src={getCourseImage(course)} alt={`${course.title} course thumbnail`} loading="lazy" onError={(e) => { e.currentTarget.src = '/course-images/development.svg'; }} />
        <span className="cover-badge">{course.isPremium ? <><LockKeyhole size={12}/> Premium</> : <><Sparkles size={12}/> Free</>}</span>
      </div>
      <div className="course-body">
        <div className="eyebrow">{course.category} · {course.level}</div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-rating"><span><Star size={13} fill="currentColor"/> {course.ratingAverage || 'New'}</span><small>{course.reviewCount || 0} reviews</small></div><div className="course-meta"><span><PlayCircle size={14}/>{course.lessons?.length || 0} lessons</span><span><Clock3 size={14}/>{minutes} min</span><strong>{course.price ? `₦${course.price.toLocaleString()}` : 'Free'}</strong></div>
        {progress !== undefined && <><ProgressBar value={progress}/><small className="progress-label">{progress}% complete</small></>}
        <div className="card-arrow"><ArrowUpRight size={17}/></div>
      </div>
    </Link>
  );
}
