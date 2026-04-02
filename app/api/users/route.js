import { getUsers, createUser, deleteUser, updateUser } from "@/controllers/userController";

export const GET = getUsers;

export const POST = createUser;

export const DELETE = deleteUser;

export const PUT = updateUser;