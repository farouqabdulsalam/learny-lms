import React, { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, ChevronRight, Code2, Layers3, PlayCircle, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API } from '../api';
import CourseCard from '../components/CourseCard';

export default function Home() {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    API.get('/courses')
      .then(r => setCourses(r.data.courses.slice(0, 3)))
      .catch(() => {});
  }, []);

  return <div className="home">
    <section className="hero hero-premium">
      <div className="hero-noise" />
      <div className="hero-glow hero-glow-a" />
      <div className="hero-glow hero-glow-b" />
      <div className="container hero-grid">
        <div className="hero-copy-wrap">
          <div className="pill hero-pill"><Sparkles size={14}/> A smarter way to learn online</div>
          <h1>Learn skills that <em>move you forward.</em></h1>
          <p className="hero-copy">Focused courses, hands-on lessons and visible progress — designed for people who want to stop collecting tutorials and start building.</p>
          <div className="hero-actions">
            <Link className="btn primary large" to="/courses">Explore courses <ArrowRight size={18}/></Link>
            <Link className="text-link" to="/register">Create a free account <ChevronRight size={16}/></Link>
          </div>
          <div className="hero-proof">
            <span><CheckCircle2/> Learn at your pace</span>
            <span><ShieldCheck/> Protected content</span>
            <span><Users/> Track progress</span>
          </div>
        </div>

        <div className="hero-panel hero-panel-animated" aria-label="Animated learning dashboard preview">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <div className="hero-ring ring-one" />
          <div className="hero-ring ring-two" />

          <div className="hero-dashboard">
            <div className="dashboard-shine" />
            <div className="hero-card-top">
              <span className="live-dot"/> LEARNING SESSION <span>NOW</span>
            </div>
            <div className="dashboard-icon"><Code2 size={38}/></div>
            <div className="dashboard-kicker">CURRENT MODULE</div>
            <h3>Build mode</h3>
            <p>Modern JavaScript</p>
            <div className="dashboard-progress-label"><span>Course progress</span><b>62%</b></div>
            <div className="fake-progress"><span/></div>
            <div className="hero-card-foot"><b>03</b><span>of 08 lessons</span><PlayCircle size={16}/></div>
            <div className="dashboard-grid-lines" />
          </div>

          <div className="hero-mini-card mini-practical">
            <span className="mini-icon"><Code2 size={17}/></span>
            <div><b>Practical</b><small>Project-based</small></div>
          </div>
          <div className="hero-mini-card mini-structured">
            <span className="mini-icon"><Layers3 size={17}/></span>
            <div><b>Structured</b><small>Clear roadmaps</small></div>
          </div>
          <div className="hero-mini-card mini-progress">
            <span className="mini-icon success-icon"><CheckCircle2 size={16}/></span>
            <div><b>Progress saved</b><small>03 lessons complete</small></div>
          </div>
          <div className="hero-floating-label"><Zap size={13}/> BUILD • LEARN • SHIP</div>
        </div>
      </div>

      <div className="container stat-strip">
        <div><Users/><b>10K+</b><span>Active learners</span></div>
        <div><BookOpen/><b>120+</b><span>Expert lessons</span></div>
        <div><PlayCircle/><b>500+</b><span>Hours of content</span></div>
        <div><BarChart3/><b>Visible</b><span>Progress tracking</span></div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head"><div><div className="eyebrow">CURATED FOR BUILDERS</div><h2>Start with something useful.</h2><p>Practical, structured and beginner-friendly courses to help you build real skills.</p></div><Link className="btn ghost" to="/courses">View all courses <ArrowRight size={16}/></Link></div>
        <div className="course-grid">{courses.map((c, i) => <CourseCard key={c._id} course={c} index={i}/>)}</div>
      </div>
    </section>

    <section className="why-section"><div className="container why-grid"><div><div className="eyebrow">WHY LEARNY</div><h2>Less noise.<br/>More momentum.</h2><p>Every screen is designed to keep you oriented: what to learn, what you finished and what comes next.</p><Link className="btn primary" to="/register">Start learning <ArrowRight size={17}/></Link></div><div className="feature-grid"><div><span className="feature-icon"><Code2/></span><b>Learn by doing</b><small>Short lessons built around practical outcomes.</small></div><div><span className="feature-icon"><Layers3/></span><b>Structured learning</b><small>Clear roadmaps from beginner to advanced.</small></div><div><span className="feature-icon"><BarChart3/></span><b>Track your progress</b><small>See exactly how much you have completed.</small></div><div><span className="feature-icon"><ShieldCheck/></span><b>Protected content</b><small>Authenticated access for premium lessons.</small></div></div></div></section>

    <section className="cta"><div className="container cta-inner"><div><div className="eyebrow">YOUR NEXT CHAPTER</div><h2>Turn one hour into one new skill.</h2><p>Join a focused learning space built around progress, not endless tabs.</p></div><Link className="btn mint" to="/register">Get started for free <ArrowRight size={18}/></Link></div></section>

    <section className="section testimonials"><div className="container"><div className="section-head"><div><div className="eyebrow">WHAT LEARNERS SAY</div><h2>Real people. Real progress.</h2></div></div><div className="testimonial-grid"><article><div className="stars">★★★★★</div><p>“Learny made learning so much easier. The lessons feel practical and well structured.”</p><b>Aisha Bello</b><small>Frontend Developer</small></article><article><div className="stars">★★★★★</div><p>“The quality of the content is amazing. I built my first portfolio using what I learned here.”</p><b>Daniel Ibrahim</b><small>UI/UX Designer</small></article><article><div className="stars">★★★★★</div><p>“I love the progress tracking and certificates. It keeps me motivated to keep going.”</p><b>Fatima Yusuf</b><small>Computer Science Student</small></article></div></div></section>
  </div>;
}
