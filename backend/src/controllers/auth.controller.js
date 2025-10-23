import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../services/email.service.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async ({ body, set }) => {
  const { email, password, role } = body;

  if (!email || !password) {
    set.status = 400;
    return { message: "Email and password are required" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      set.status = 409;
      return { message: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "ATTENDEE", // Default role
      },
    });

    // Send a mock welcome email
    await sendWelcomeEmail(user.email);

    set.status = 201;
    return { message: "User created successfully. A welcome email has been sent." };
  } catch (error) {
    console.error("Signup Error:", error);
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};

export const login = async ({ body, set }) => {
  const { email, password } = body;

  if (!email || !password) {
    set.status = 400;
    return { message: "Email and password are required" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      set.status = 404;
      return { message: "User not found" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      set.status = 401;
      return { message: "Invalid credentials" };
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token };
  } catch (error) {
    console.error("Login Error:", error);
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};