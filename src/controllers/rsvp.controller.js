
import { PrismaClient } from "@prisma/client";
import { server } from "../index.js"; // Import the Elysia server instance for WebSockets

const prisma = new PrismaClient();

export const rsvpToEvent = async ({ params, body, user, set }) => {
  const { id: eventId } = params;
  const { status } = body;
  const { userId, role } = user;

  // As per requirement, only attendees can RSVP.
  // You might adjust this logic based on broader requirements, e.g., organizers can also RSVP.
  if (role !== "ATTENDEE") {
    set.status = 403;
    return { message: "Forbidden: Only attendees can RSVP to events." };
  }

  if (!status || !["GOING", "MAYBE", "NOT_GOING"].includes(status)) {
    set.status = 400;
    return { message: "Invalid RSVP status provided." };
  }

  try {
    // Check if the event exists and is approved
    const event = await prisma.event.findFirst({
      where: { id: eventId, approved: true },
    });

    if (!event) {
      set.status = 404;
      return { message: "Approved event not found." };
    }

    // Use upsert to create a new RSVP or update an existing one
    const rsvp = await prisma.rSVP.upsert({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      update: { status },
      create: {
        userId,
        eventId,
        status,
      },
      include: { user: { select: { email: true } } },
    });

    // WebSocket broadcast to the 'rsvps' channel
    server.publish("rsvps", JSON.stringify({ type: "RSVP_UPDATED", payload: rsvp }));

    set.status = 200;
    return { message: "RSVP updated successfully", rsvp };
  } catch (error) {
    console.error("RSVP Error:", error);
    // Handle potential unique constraint violation if upsert isn't used or fails
    if (error.code === "P2002") {
      set.status = 409;
      return { message: "You have already RSVP'd to this event." };
    }
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};
