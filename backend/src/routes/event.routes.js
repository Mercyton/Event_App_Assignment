
import { Elysia } from "elysia";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  approveEvent,
} from "../controllers/event.controller.js";
import { isAuthenticated, isOrganizer, isAdmin } from "../middleware/auth.middleware.js";

export const eventRoutes = new Elysia({ prefix: "/events" })
  // Authenticated route to get all approved events
  .get("/", getEvents, { before: [isAuthenticated] })

  // Organizer-only route to create an event
  .post("/", createEvent, { before: [isAuthenticated, isOrganizer] })

  // Organizer or Admin routes to update/delete
  .put("/:id", updateEvent, {
    before: [isAuthenticated, (context) => {
      if (context.user.role !== 'ORGANIZER' && context.user.role !== 'ADMIN') {
        context.set.status = 403;
        return { message: 'Forbidden: Requires ORGANIZER or ADMIN role' };
      }
    }]
  })
  .delete("/:id", deleteEvent, {
    before: [isAuthenticated, (context) => {
      if (context.user.role !== 'ORGANIZER' && context.user.role !== 'ADMIN') {
        context.set.status = 403;
        return { message: 'Forbidden: Requires ORGANIZER or ADMIN role' };
      }
    }]
  })

  // Admin-only route to approve an event
  .put("/:id/approve", approveEvent, { before: [isAuthenticated, isAdmin] });
