import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, redirect }) => {
    // Déconnecter l'utilisateur via PocketBase
    locals.pb.authStore.clear();

    // Retourner une réponse vide avec le cookie de déconnexion
    const response = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });

    response.headers.append("set-cookie", locals.pb.authStore.exportToCookie());
    return response;
};
