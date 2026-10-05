import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  roles: { type: [String], enum: ['student', 'instructor', 'admin'], default: ['student'] },
  activeRole: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  emailVerified: { type: Boolean, default: true },
  verificationCodeHash: { type: String, default: null, select: false },
  verificationExpiresAt: { type: Date, default: null, select: false },
  instructorAccess: {
    status: { type: String, enum: ['inactive', 'active'], default: 'inactive' },
    plan: { type: String, enum: ['monthly', 'annual', null], default: null },
    expiresAt: { type: Date, default: null }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('validate', function(next) {
  if (!this.roles?.length) this.roles = ['student'];
  if (!this.roles.includes(this.activeRole)) this.activeRole = this.roles[0];
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.hasInstructorAccess = function() {
  return this.roles.includes('instructor') && this.instructorAccess?.status === 'active' &&
    (!this.instructorAccess.expiresAt || this.instructorAccess.expiresAt > new Date());
};

export default mongoose.model('User', userSchema);
