import { Elysia, WSType } from 'elysia';

// Define the shape of a broadcast message
export interface WSMessage {
  type: 'event_created' | 'event_updated' | 'event_deleted' | 'event_approved' | 'rsvp_change';
  payload: any;
}

// Global set to hold all connected WebSocket clients
const clients = new Set<WSType<Elysia, 'ws'>>();

/**
 * Adds a new client to the broadcast list.
 * @param ws The Elysia WebSocket object.
 */
export const addClient = (ws: WSType<Elysia, 'ws'>) => {
  clients.add(ws);
};

/**
 * Removes a client from the broadcast list.
 * @param ws The Elysia WebSocket object.
 */
export const removeClient = (ws: WSType<Elysia, 'ws'>) => {
  clients.delete(ws);
};

/**
 * Broadcasts a message to all connected clients.
 * @param message The message object to send.
 */
export const broadcast = (message: WSMessage) => {
  const messageString = JSON.stringify(message);
  
  // Iterate through all clients and send the message
  clients.forEach(client => {
    try {
      if (client.readyState === 1) { // Check if connection is OPEN
        client.send(messageString);
      }
    } catch (e) {
      console.error('Error sending message to client:', e);
    }
  });
  
  console.log(`Broadcasted message of type: ${message.type}`);
};