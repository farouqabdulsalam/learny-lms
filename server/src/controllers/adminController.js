import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export async function overview(req, res) {
  try {
    const [pendingCourses, notifications, students, instructors, courses, approvedCourses, rejectedCourses] = await Promise.all([
      Course.find({ status: 'pending' }).populate('instructor', 'name email').sort({ createdAt: -1 }),
      Notification.find({ recipient: req.user._id }).populate('course', 'title status').sort({ createdAt: -1 }).limit(30),
      User.countDocuments({ roles: 'student' }), User.countDocuments({ roles: 'instructor' }),
      Course.countDocuments(), Course.countDocuments({ status: 'approved' }), Course.countDocuments({ status: 'rejected' })
    ]);
    res.json({ pendingCourses, notifications, counts: { pendingCourses: pendingCourses.length, unread: notifications.filter(n => !n.read).length, students, instructors, courses, approvedCourses, rejectedCourses } });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function reviewCourse(req, res) {
  try {
    const { decision, reason = '' } = req.body;
    if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ message: 'Decision must be approved or rejected.' });
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    course.status = decision;
    course.rejectionReason = decision === 'rejected' ? reason.trim() : '';
    await course.save();
    await Notification.create({ recipient: course.instructor._id, type: decision === 'approved' ? 'course-approved' : 'course-rejected', course: course._id, title: decision === 'approved' ? 'Course approved' : 'Course needs changes', message: decision === 'approved' ? `Your course “${course.title}” is now live on Learny.` : `Your course “${course.title}” was rejected.${reason ? ` Reason: ${reason}` : ''}` });
    res.json({ message: decision === 'approved' ? 'Course approved and published.' : 'Course rejected.', course });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function markNotificationsRead(req, res) {
  try { await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } }); res.json({ message: 'Notifications marked as read.' }); }
  catch (error) { res.status(500).json({ message: error.message }); }
}
