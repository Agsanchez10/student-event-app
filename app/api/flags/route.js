import { createFlag, getFlags, deleteFlag, updateFlag } from "@/controllers/flagController";

export const GET = getFlags;

export const POST = createFlag; 

export const DELETE = deleteFlag;

export const PUT = updateFlag;