import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const pb = locals.pb;
        if (!pb) return new Response("PocketBase indisponible", { status: 500 });

        let data;
        try {
            data = await request.formData();
        } catch {
            return new Response(
                JSON.stringify({ error: "Données invalides" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        const email = data.get("email") as string;
        const password = data.get("password") as string;
        const prenom = data.get("prenom") as string;
        const nom = data.get("nom") as string;
        const avatarFile = data.get("avatar") as File;

        if (!email || !password || !prenom || !nom) {
            return new Response(
                JSON.stringify({ error: "Tous les champs sont requis" }),
                { status: 400 },
            );
        }

        if (password.length < 6) {
            return new Response(
                JSON.stringify({ error: "Le mot de passe doit contenir au moins 6 caractères" }),
                { status: 400 },
            );
        }

        // Créer l'utilisateur avec avatar
        const createData: any = {
            email,
            password,
            passwordConfirm: password,
            prenom,
            nom,
        };

        // Si un avatar est fourni, l'ajouter à la FormData
        let newUser;
        if (avatarFile && avatarFile.size > 0) {
            const userFormData = new FormData();
            userFormData.append("email", email);
            userFormData.append("password", password);
            userFormData.append("passwordConfirm", password);
            userFormData.append("prenom", prenom);
            userFormData.append("nom", nom);
            userFormData.append("avatar", avatarFile);

            newUser = await pb.collection("users").create(userFormData);
        } else {
            newUser = await pb.collection("users").create(createData);
        }

        // Auto-login after signup
        const authData = await pb
            .collection("users")
            .authWithPassword(email, password);

        return new Response(
            JSON.stringify({
                token: authData.token,
                user: authData.record,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } },
        );
    } catch (e) {
        console.error("Erreur signup:", e);
        const errorMsg = String(e);
        let message = "Erreur lors de l'inscription";

        if (errorMsg.includes("duplicate")) {
            message = "Cet email est déjà utilisé";
        } else if (errorMsg.includes("email")) {
            message = "Email invalide";
        } else if (errorMsg.includes("password")) {
            message = "Mot de passe invalide";
        } else {
            // Log la vraie erreur pour déboguer
            console.error("Détails erreur:", errorMsg);
            message = errorMsg.substring(0, 100);
        }

        return new Response(
            JSON.stringify({ error: message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }
};
