
export async function GET(request) {
    // Check if the user is authenticated by looking for a valid session cookie
    const cookie = request.headers.get("cookie");
    if (cookie && cookie.includes("token=")) {
        return new Response(null, { status: 200 });
    } else {
        return new Response(null, { status: 401 });
    }
}