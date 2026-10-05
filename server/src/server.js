import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import instructorRoutes from './routes/instructor.js';
import adminRoutes from './routes/admin.js';
import { protect } from './middleware/auth.js';
import { myLearning } from './controllers/courseController.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.get('/api/health', (_, res) => res.json({ ok: true, name: 'Learny API' }));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/my/learning', protect, myLearning);
app.use((_, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((err, _, res, __) => res.status(500).json({ message: err.message || 'Server error.' }));

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`Learny API running on http://localhost:${port}`))).catch(err => { console.error(err); process.exit(1); });
