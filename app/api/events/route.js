import { getEvents, createEvent, deleteEvent, updateEvent } from "@/controllers/eventController";

export const GET = getEvents;

export const POST = createEvent;

export const DELETE = deleteEvent;

export const PUT = updateEvent;