const request=require('supertest');
const mongoose=require('mongoose');
const app=require('../server');
const User=require('../src/models/User.model');
const generateToken=require('../src/utils/generateToken');

let token;
beforeAll(async()=>{
  await mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/smartcv_test_profile');
  const user=await User.create({fullName:'Profile Test',email:'profile@test.com',phone:'01700000001',password:'Test1234',isVerified:true});
  token=generateToken(user._id);
});
afterAll(async()=>{
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Profile API',()=>{
  test('GET /api/profile — unauthorized without token',async()=>{
    const res=await request(app).get('/api/profile');
    expect(res.statusCode).toBe(401);
  });
  test('POST /api/profile — create profile',async()=>{
    const res=await request(app).post('/api/profile').set('Authorization',`Bearer ${token}`).send({nationality:'Bangladeshi',gender:'Male'});
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
  test('GET /api/profile — get profile',async()=>{
    const res=await request(app).get('/api/profile').set('Authorization',`Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.profile).toBeDefined();
  });
});
