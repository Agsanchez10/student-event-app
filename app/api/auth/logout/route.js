
export async function POST(request) {
    // hammer the logout endpoint to clear the cookie
    return new Response(null, {
        status: 200,
        headers: {
            "Set-Cookie": "token=; HttpOnly; Path=/; Max-Age=0",
        },
    });
}

