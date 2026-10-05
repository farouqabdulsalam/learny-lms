import Course from '../models/Course.js';
import Notification from '../models/Notification.js';

function publicCourse(course) {
  const data = course.toObject ? course.toObject() : course;
  return { ...data, lessons: (data.lessons || []).map(({ videoUrl, ...lesson }) => ({ ...lesson, hasVideo: true })) };
}

export async function listInstructorCourses(req, res) {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({ updatedAt: -1 });
    res.json({ courses: courses.map(publicCourse) });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function updateCourse(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructor: req.user._id });
    if (!course) return res.status(404).json({ message: 'Course not found or you are not the instructor.' });
    const { title, description, category, level, price, isPremium, thumbnail } = req.body;
    if (!title || !description || !category) return res.status(400).json({ message: 'Title, description and category are required.' });
    Object.assign(course, { title, description, category, level, price: Number(price || 0), isPremium: Boolean(isPremium), thumbnail: thumbnail || '' });
    if (course.status === 'approved') course.status = 'pending';
    course.rejectionReason = '';
    await course.save();
    res.json({ course: publicCourse(course), message: 'Course updated and sent for review.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function deleteCourse(req, res) {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, instructor: req.user._id });
    if (!course) return res.status(404).json({ message: 'Course not found or you are not the instructor.' });
    res.json({ message: 'Course deleted.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function resubmitCourse(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructor: req.user._id });
    if (!course) return res.status(404).json({ message: 'Course not found or you are not the instructor.' });
    if (course.status !== 'rejected') return res.status(400).json({ message: 'Only rejected courses can be resubmitted.' });
    course.status = 'pending';
    course.rejectionReason = '';
    await course.save();
    const admin = await (await import('../models/User.js')).default.findOne({ email: process.env.ADMIN_EMAIL?.trim().toLowerCase(), roles: 'admin' });
    if (admin) await Notification.create({ recipient: admin._id, type: 'course-submitted', course: course._id, title: 'Course resubmitted', message: `${req.user.name} resubmitted “${course.title}” for approval.` });
    res.json({ course: publicCourse(course), message: 'Course resubmitted for admin approval.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
}
