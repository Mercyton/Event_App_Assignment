
import { Elysia } from "elysia";
import { rsvpToEvent } from "../controllers/rsvp.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

// The route is POST /events/:id/rsvp, so we prefix with /events
export const rsvpRoutes = new Elysia({ prefix: "/events" })
    .post("/:id/rsvp", rsvpToEvent, { before: [isAuthenticated] });
