const request=require('supertest');
const mongoose=require('mongoose');
const app=require('../server');

const TEST_USER={fullName:'Test User',email:'test@smartcv.com',phone:'01712345678',password:'Test1234'};

beforeAll(async()=>{
  await mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/smartcv_test');
});
afterAll(async()=>{
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API',()=>{
  test('POST /api/auth/register — should register user',async()=>{
    const res=await request(app).post('/api/auth/register').send(TEST_USER);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(TEST_USER.email);
  });

  test('POST /api/auth/login — should fail without verification',async()=>{
    const res=await request(app).post('/api/auth/login').send({emailOrPhone:TEST_USER.email,password:TEST_USER.password});
    expect(res.statusCode).toBe(403);
  });

  test('POST /api/auth/login — should fail with wrong password',async()=>{
    const res=await request(app).post('/api/auth/login').send({emailOrPhone:TEST_USER.email,password:'WrongPass'});
    expect(res.statusCode).toBe(401);
  });
});

describe('Health Check',()=>{
  test('GET /health — should return OK',async()=>{
    const res=await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
