// DEPRECATED: This route has been migrated to server actions in /app/actions/clubActions.js
// Use joinClubAction() server action instead
// File kept for reversion purposes

export async function POST() {
  return new Response(
    JSON.stringify({ error: "This endpoint has been deprecated. Use server actions instead." }),
    { status: 410, headers: { "Content-Type": "application/json" } }
  );
}