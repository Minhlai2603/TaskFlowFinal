import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../utils/jwt';

async function test() {
  console.log('--- Auth Smoke Test ---');
  
  // Test Bcrypt
  const pass = 'password123';
  const hash = await bcrypt.hash(pass, 12);
  const match = await bcrypt.compare(pass, hash);
  console.log('Bcrypt Hash/Match:', match ? 'PASSED' : 'FAILED');

  // Test JWT
  const payload = { userId: '123', email: 'test@example.com' };
  const token = signToken(payload);
  const decoded = verifyToken(token);
  console.log('JWT Sign/Verify:', decoded.userId === payload.userId ? 'PASSED' : 'FAILED');
}

test().catch(console.error);
