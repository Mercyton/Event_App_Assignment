import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_FALLBACK_KEY';
const JWT_EXPIRY = '7d';

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

// Function to generate a JWT
export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// Function to verify a JWT
export const verifyToken = (token: string): AuthPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload;
  } catch (error) {
    return null; // Token is invalid or expired
  }
};