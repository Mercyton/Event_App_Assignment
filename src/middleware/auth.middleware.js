import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to check for a valid JWT
export const isAuthenticated = (handler) => (context) => {
  const { headers, set } = context;
  const authHeader = headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    set.status = 401;
    return { message: "Unauthorized: No token provided" };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    context.user = decoded; // Attach user payload to the context
    return handler(context);
  } catch (error) {
    set.status = 401;
    return { message: "Unauthorized: Invalid token" };
  }
};

// Higher-order function to check for a specific role
export const hasRole = (requiredRole) => (handler) => (context) => {
  const { user, set } = context;

  if (!user || user.role !== requiredRole) {
    set.status = 403;
    return { message: `Forbidden: Requires ${requiredRole} role` };
  }

  return handler(context);
};

// Specific role checks for convenience
export const isAdmin = hasRole("ADMIN");
export const isOrganizer = hasRole("ORGANIZER");