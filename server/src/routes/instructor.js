import { Router } from 'express';
import { createCourse, addLesson } from '../controllers/courseController.js';
import { listInstructorCourses, updateCourse, deleteCourse, resubmitCourse } from '../controllers/instructorController.js';
import { protect, requireActiveRole, requireInstructorAccess } from '../middleware/auth.js';
const router = Router();
router.use(protect, requireActiveRole('instructor'));
router.get('/status', (req, res) => res.json({ active: req.user.hasInstructorAccess(), access: req.user.instructorAccess, roles: req.user.roles }));
router.get('/courses', listInstructorCourses);
router.post('/activate', async (req, res) => {
  const { plan = 'monthly' } = req.body;
  if (!['monthly', 'annual'].includes(plan)) return res.status(400).json({ message: 'Invalid instructor plan.' });
  const days = plan === 'annual' ? 365 : 30;
  req.user.instructorAccess = { status: 'active', plan, expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000) };
  await req.user.save();
  res.json({ message: 'Instructor access activated for development. Add Paystack/Flutterwave credentials for real payments.', access: req.user.instructorAccess });
});

router.post('/payment/paystack/initialize', async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body;
    const amounts = { monthly: 250000, annual: 2000000 };
    if (!amounts[plan]) return res.status(400).json({ message: 'Invalid instructor plan.' });
    if (!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({ message: 'Paystack is not configured. Add PAYSTACK_SECRET_KEY to server/.env.' });
    const reference = `learny_${req.user._id}_${plan}_${Date.now()}`;
    const response = await fetch('https://api.paystack.co/transaction/initialize', { method:'POST', headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,'Content-Type':'application/json'}, body:JSON.stringify({email:req.user.email,amount:amounts[plan],reference,metadata:{userId:req.user._id.toString(),plan},callback_url:`${process.env.CLIENT_URL || 'http://localhost:5173'}/instructor?payment=${reference}`}) });
    const data = await response.json();
    if (!response.ok || !data.status) return res.status(502).json({ message: data.message || 'Could not initialize Paystack payment.' });
    res.json({ authorization_url:data.data.authorization_url, reference });
  } catch (error) { res.status(500).json({ message:error.message }); }
});
router.post('/payment/paystack/verify/:reference', async (req,res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({ message:'Paystack is not configured.' });
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(req.params.reference)}`, { headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`} });
    const data=await response.json();
    if (!response.ok || !data.status || data.data?.status !== 'success') return res.status(402).json({ message:data.message || 'Payment has not been completed.' });
    const meta=data.data.metadata || {};
    if (meta.userId !== req.user._id.toString()) return res.status(403).json({ message:'Payment reference does not belong to this account.' });
    const plan=meta.plan; const days=plan==='annual'?365:30;
    req.user.instructorAccess={status:'active',plan,expiresAt:new Date(Date.now()+days*24*60*60*1000)}; await req.user.save();
    res.json({ message:'Payment verified and instructor access activated.', access:req.user.instructorAccess });
  } catch(error){res.status(500).json({message:error.message});}
});

router.use(requireInstructorAccess);
router.post('/courses', createCourse);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.post('/courses/:id/resubmit', resubmitCourse);
router.post('/courses/:id/lessons', addLesson);
export default router;
