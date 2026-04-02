import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
    if (cached.conn) { return cached.conn; }

    cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {serverSelectionTimeoutMS: 5000,});
    cached.conn = await cached.promise;
    return cached.conn;
}

export function withDB(handler) {
    return async function(...args) {
        try {
            await connectToDatabase();
            return await handler(...args);
        } catch (error) {
            console.error("Database connection error:", error);
            return new Response(JSON.stringify({ error: "Database connection failed" }), { status: 500 });
        }   
    }
}