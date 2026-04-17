// DEPRECATED: This route has been migrated to server actions in /app/actions/userActions.js
// Use fetchUser(), modifyUser(), removeUser() server actions instead
// File kept for reversion purposes

export async function GET() {
  return new Response(
    JSON.stringify({ error: "This endpoint has been deprecated. Use server actions instead." }),
    { status: 410, headers: { "Content-Type": "application/json" } }
  );
}