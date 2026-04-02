import { getClubs, createClub, deleteClub, updateClub } from "@/controllers/clubController";

export const GET = getClubs;

export const POST = createClub;

export const DELETE = deleteClub;

export const PUT = updateClub;