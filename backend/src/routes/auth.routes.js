import { Elysia } from "elysia";
import { signup, login } from "../controllers/auth.controller.js";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/signup", signup)
  .post("/login", login);