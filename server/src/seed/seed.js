import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

const video='https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
async function run(){
 await connectDB();
 await Course.updateMany({ status: { $exists: false } }, { $set: { status: 'approved' } });
 const adminEmail=process.env.ADMIN_EMAIL?.trim().toLowerCase(); const adminPassword=process.env.ADMIN_PASSWORD;
 if(adminEmail&&adminPassword){
   const hash=await bcrypt.hash(adminPassword,12);
   await User.updateOne({email:adminEmail},{$set:{name:process.env.ADMIN_NAME||'Learny Admin',email:adminEmail,password:hash,roles:['admin'],activeRole:'admin',emailVerified:true}},{upsert:true});
   console.log(`Admin account ready: ${adminEmail}`);
 }
 let instructor=await User.findOne({roles:'instructor'});
 if(!instructor){
   instructor=await User.create({name:'Learny Instructor',email:`instructor+${Date.now()}@gmail.com`,password:process.env.SEED_INSTRUCTOR_PASSWORD||'learny123456',roles:['instructor'],activeRole:'instructor',emailVerified:true,instructorAccess:{status:'active',plan:'annual',expiresAt:new Date(Date.now()+365*24*60*60*1000)}});
 }
 const existing=await Course.countDocuments({instructor:instructor._id});
 if(existing>0){console.log(`Seed skipped: ${existing} course(s) already exist.`);await mongoose.disconnect();return;}
 await Course.create([
 {title:'Modern JavaScript: From Zero to Builder',slug:'modern-javascript',description:'Master the JavaScript foundations you need to build confident, interactive web applications.',category:'Development',level:'Beginner',price:12000,isPremium:true,status:'approved',instructor:instructor._id,lessons:[{title:'Welcome to the course',description:'Understand the roadmap and what you will build.',videoUrl:video,duration:6,isPreview:true,order:1},{title:'Variables, types and operators',description:'Build a strong JavaScript foundation.',videoUrl:video,duration:14,order:2},{title:'Functions and reusable logic',description:'Turn repeated ideas into clean functions.',videoUrl:video,duration:18,order:3},{title:'DOM interactions',description:'Make your browser interfaces respond to users.',videoUrl:video,duration:22,order:4}]},
 {title:'UI Design Systems for Developers',slug:'ui-design-systems',description:'Learn how to create consistent, elegant interfaces using spacing, typography, color and reusable components.',category:'Design',level:'Intermediate',price:9000,isPremium:true,status:'approved',instructor:instructor._id,lessons:[{title:'The visual hierarchy',description:'Create interfaces that feel intentional.',videoUrl:video,duration:9,isPreview:true,order:1},{title:'Color and contrast',description:'Use a small palette without losing personality.',videoUrl:video,duration:15,order:2},{title:'Components and consistency',description:'Design reusable building blocks.',videoUrl:video,duration:17,order:3}]},
 {title:'Productivity for Deep Learning',slug:'deep-learning-productivity',description:'A practical system for turning study time into consistent progress.',category:'Productivity',level:'Beginner',price:0,isPremium:false,status:'approved',instructor:instructor._id,lessons:[{title:'Build your learning system',description:'Set a clear weekly loop.',videoUrl:video,duration:8,isPreview:true,order:1},{title:'Active recall and practice',description:'Use deliberate practice to retain more.',videoUrl:video,duration:12,order:2}]}
 ]);
 console.log('Seed complete.'); await mongoose.disconnect();
}
run().catch(err=>{console.error(err);process.exit(1);});
