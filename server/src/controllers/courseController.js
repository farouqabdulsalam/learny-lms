import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';

function publicCourse(course) {
  const data = course.toObject ? course.toObject() : course;
  return { ...data, lessons: (data.lessons || []).map(({ videoUrl, ...lesson }) => ({ ...lesson, hasVideo: true })) };
}

export async function listCourses(req, res) {
  try {
    const { search = '', category = 'All', level = 'All', sort = 'newest' } = req.query;
    const query = { status: 'approved' };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { category: { $regex: search, $options: 'i' } }];
    if (category && category !== 'All') query.category = category;
    if (level && level !== 'All') query.level = level;
    const sortMap = { newest: { createdAt: -1 }, rating: { ratingAverage: -1, reviewCount: -1 }, priceLow: { price: 1 }, priceHigh: { price: -1 } };
    const courses = await Course.find(query).populate('instructor', 'name').sort(sortMap[sort] || sortMap.newest);
    res.json({ courses: courses.map(publicCourse) });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function getCourse(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.id, status: 'approved' }).populate('instructor', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    const enrollment = req.user && req.user.activeRole === 'student' ? await Enrollment.findOne({ student: req.user._id, course: course._id }) : null;
    const reviews = await Review.find({ course: course._id }).populate('student', 'name').sort({ createdAt: -1 }).limit(20);
    res.json({ course: publicCourse(course), enrolled: Boolean(enrollment), progress: enrollment ? enrollment.completedLessons.length : 0, reviews });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function enroll(req, res) {
  try {
    if (req.user.activeRole !== 'student' || req.user.roles?.includes('admin')) return res.status(403).json({ message: 'Only student mode can enroll in courses.' });
    const course = await Course.findOne({ _id: req.params.id, status: 'approved' });
    if (!course) return res.status(404).json({ message: 'Course not found or not approved.' });
    const enrollment = await Enrollment.findOneAndUpdate({ student: req.user._id, course: course._id }, { $setOnInsert: { student: req.user._id, course: course._id } }, { upsert: true, new: true });
    res.status(201).json({ message: 'You are enrolled.', enrollment });
  } catch (error) { res.status(500).json({ message: error.code === 11000 ? 'Already enrolled.' : error.message }); }
}

export async function getLesson(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.id, status: 'approved' }).populate('instructor', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (course.isPremium && !enrollment && !lesson.isPreview) return res.status(403).json({ message: 'Enroll in this course to unlock this lesson.' });
    res.json({ lesson: lesson.toObject(), course: { id: course._id, title: course.title, isPremium: course.isPremium, lessons: course.lessons.map(l => ({ _id: l._id, title: l.title, order: l.order, duration: l.duration })) }, completed: enrollment ? enrollment.completedLessons.some(id => id.toString() === lesson._id.toString()) : false });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function updateProgress(req, res) {
  try {
    const { completed } = req.body;
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
    if (!enrollment) return res.status(403).json({ message: 'Enroll in the course first.' });
    const exists = enrollment.completedLessons.some(id => id.toString() === req.params.lessonId);
    if (completed && !exists) enrollment.completedLessons.push(req.params.lessonId);
    if (!completed && exists) enrollment.completedLessons = enrollment.completedLessons.filter(id => id.toString() !== req.params.lessonId);
    await enrollment.save();
    const course = await Course.findById(req.params.id).select('lessons title');
    const total = course.lessons.length || 1;
    const percentage = Math.round((enrollment.completedLessons.length / total) * 100);
    res.json({ completedLessons: enrollment.completedLessons, percentage, completedCourse: percentage >= 100 });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function myLearning(req, res) {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate({ path: 'course', populate: { path: 'instructor', select: 'name' } }).sort({ updatedAt: -1 });
    const learning = enrollments.filter(e => e.course).map(e => ({ id: e._id, course: publicCourse(e.course), completedLessons: e.completedLessons, percentage: Math.round((e.completedLessons.length / (e.course.lessons.length || 1)) * 100), lastActivity: e.updatedAt }));
    res.json({ learning, stats: { total: learning.length, completed: learning.filter(x => x.percentage === 100).length, inProgress: learning.filter(x => x.percentage > 0 && x.percentage < 100).length } });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function createCourse(req, res) {
  try {
    const { title, description, category, level, price = 0, isPremium = false, thumbnail = '' } = req.body;
    if (!req.user.hasInstructorAccess()) return res.status(402).json({ message: 'Activate an instructor plan before creating courses.' });
    if (!title || !description || !category) return res.status(400).json({ message: 'Title, description and category are required.' });
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`;
    const course = await Course.create({ title, slug, description, category, level, price, isPremium, thumbnail, instructor: req.user._id, status: 'pending' });
    const Notification = (await import('../models/Notification.js')).default;
    const User = (await import('../models/User.js')).default;
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL?.trim().toLowerCase(), roles: 'admin' });
    if (admin) await Notification.create({ recipient: admin._id, type: 'course-submitted', course: course._id, title: 'Course awaiting review', message: `${req.user.name} submitted “${course.title}” for approval.` });
    res.status(201).json({ course: publicCourse(course), status: 'pending', message: 'Course submitted for admin approval.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function addLesson(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructor: req.user._id });
    if (!course) return res.status(404).json({ message: 'Course not found or you are not the instructor.' });
    const { title, description = '', videoUrl, duration = 8, isPreview = false } = req.body;
    if (!title || !videoUrl) return res.status(400).json({ message: 'Lesson title and video URL are required.' });
    course.lessons.push({ title, description, videoUrl, duration, isPreview, order: course.lessons.length + 1 });
    if (course.status === 'approved') course.status = 'pending';
    await course.save();
    res.status(201).json({ course: publicCourse(course), message: 'Lesson added. Course is awaiting review.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function reviewCourse(req, res) {
  try {
    const { rating, comment = '' } = req.body;
    if (req.user.activeRole !== 'student') return res.status(403).json({ message: 'Switch to student mode to review courses.' });
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
    if (!enrollment) return res.status(403).json({ message: 'Enroll in and complete the course before reviewing it.' });
    const course = await Course.findById(req.params.id);
    if (!course || course.status !== 'approved') return res.status(404).json({ message: 'Course not found.' });
    const total = course.lessons.length || 1;
    if (enrollment.completedLessons.length < total) return res.status(403).json({ message: 'Complete the course before leaving a review.' });
    await Review.findOneAndUpdate({ course: course._id, student: req.user._id }, { rating: Number(rating), comment: comment.trim() }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const stats = await Review.aggregate([{ $match: { course: course._id } }, { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
    course.ratingAverage = Number((stats[0]?.avg || 0).toFixed(1));
    course.reviewCount = stats[0]?.count || 0;
    await course.save();
    res.json({ message: 'Review saved.', ratingAverage: course.ratingAverage, reviewCount: course.reviewCount });
  } catch (error) { res.status(500).json({ message: error.code === 11000 ? 'You already reviewed this course.' : error.message }); }
}
