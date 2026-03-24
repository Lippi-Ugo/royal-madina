import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const pb = locals.pb;
        if (!pb) return new Response("PocketBase indisponible", { status: 500 });

        let data;
        try {
            data = await request.json();
        } catch {
            return new Response(
                JSON.stringify({ error: "Body JSON invalide" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        const { email, password } = data as {
            email?: string;
            password?: string;
        };

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: "Email et mot de passe requis" }),
                { status: 400 },
            );
        }

        // PocketBase authentication
        const authData = await pb
            .collection("users")
            .authWithPassword(email, password);

        // Return token and user data
        return new Response(
            JSON.stringify({
                token: authData.token,
                user: authData.record,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (e) {
        console.error("Erreur login:", e);
        return new Response(
            JSON.stringify({
                error:
                    String(e).includes("Invalid credentials")
                        ? "Email ou mot de passe incorrect"
                        : String(e),
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }
};
