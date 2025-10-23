import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import "dotenv/config";

// Import routes (to be created)
import { authRoutes } from "./routes/auth.routes.js";
import { eventRoutes } from "./routes/event.routes.js";
import { rsvpRoutes } from "./routes/rsvp.routes.js";

const app = new Elysia()
  // --- Plugins ---
  .use(cors())
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Event Management API",
          version: "1.0.0",
          description: "API documentation for the Monolith Event Management Application",
        },
      },
    })
  )

  // --- WebSockets ---
  .ws("/ws", {
    open(ws) {
      console.log("WebSocket client connected", ws.id);
      ws.subscribe("events");
      ws.subscribe("rsvps");
    },
    close(ws) {
      console.log("WebSocket client disconnected", ws.id);
    },
    message(ws, message) {
      console.log("Received message:", message);
    },
  })

  // --- API Routes ---
  .group("/api", (app) =>
    app
      .use(authRoutes)
      .use(eventRoutes)
      .use(rsvpRoutes)
      .get("/", () => "API root")
  )

  // --- Root Route ---
  .get("/", () => "Event Management API Running ✅")

  // --- Error Handling ---
  .onError(({ code, error, set }) => {
    console.error(`Error ${code}: ${error.message}`);
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { message: "Not Found" };
    }
    set.status = 500;
    return { message: "Internal Server Error" };
  })

  // --- Server ---
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export const server = app;