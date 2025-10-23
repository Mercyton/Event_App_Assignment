
import { PrismaClient } from "@prisma/client";
import { server } from "../index.js"; // Import the Elysia server instance for WebSockets

const prisma = new PrismaClient();

// Get all approved events
export const getEvents = async ({ set }) => {
  try {
    const events = await prisma.event.findMany({
      where: { approved: true },
      include: { organizer: { select: { email: true } }, rsvps: true },
      orderBy: { date: "asc" },
    });
    return events;
  } catch (error) {
    console.error("Get Events Error:", error);
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};

// Create a new event
export const createEvent = async ({ body, user, set }) => {
  const { title, description, date, location } = body;

  if (!title || !description || !date || !location) {
    set.status = 400;
    return { message: "All fields are required" };
  }

  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        organizerId: user.userId,
      },
    });

    // WebSocket broadcast
    server.publish("events", JSON.stringify({ type: "EVENT_CREATED", payload: newEvent }));

    set.status = 201;
    return newEvent;
  } catch (error) {
    console.error("Create Event Error:", error);
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};

// Update an event
export const updateEvent = async ({ params, body, user, set }) => {
  const { id } = params;
  try {
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      set.status = 404;
      return { message: "Event not found" };
    }

    // Only the organizer or an admin can update the event
    if (event.organizerId !== user.userId && user.role !== "ADMIN") {
      set.status = 403;
      return { message: "Forbidden: You are not authorized to update this event" };
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { ...body, date: body.date ? new Date(body.date) : undefined },
    });

    // WebSocket broadcast
    server.publish("events", JSON.stringify({ type: "EVENT_UPDATED", payload: updatedEvent }));

    return updatedEvent;
  } catch (error) {
    console.error("Update Event Error:", error);
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};

// Delete an event
export const deleteEvent = async ({ params, user, set }) => {
  const { id } = params;
  try {
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      set.status = 404;
      return { message: "Event not found" };
    }

    // Only the organizer or an admin can delete the event
    if (event.organizerId !== user.userId && user.role !== "ADMIN") {
      set.status = 403;
      return { message: "Forbidden: You are not authorized to delete this event" };
    }

    await prisma.event.delete({ where: { id } });

    // WebSocket broadcast
    server.publish("events", JSON.stringify({ type: "EVENT_DELETED", payload: { id } }));

    set.status = 204; // No Content
  } catch (error) {
    console.error("Delete Event Error:", error);
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};

// Approve an event (Admin only)
export const approveEvent = async ({ params, set }) => {
  const { id } = params;
  try {
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      set.status = 404;
      return { message: "Event not found" };
    }

    const approvedEvent = await prisma.event.update({
      where: { id },
      data: { approved: true },
    });

    // WebSocket broadcast
    server.publish("events", JSON.stringify({ type: "EVENT_APPROVED", payload: approvedEvent }));

    return { message: "Event approved successfully", event: approvedEvent };
  } catch (error) {
    console.error("Approve Event Error:", error);
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};
