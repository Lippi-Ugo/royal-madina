import type { APIRoute } from "astro";
import { stripe } from "../../../lib/stripe";

export const prerender = false;

type PanierItem = {
    type: "pizza" | "boisson";
    id: string;
    nom: string;
    prix: number;
    quantite: number;
};

type CommandeInfos = {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    adresse?: string;
    type_commande: string;
    heure_souhaitee: string;
    notes?: string;
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const pb = locals.pb;
        if (!pb) {
            console.error("❌ pb non disponible");
            return new Response(JSON.stringify({ error: "PocketBase indisponible" }), { status: 500 });
        }

        const pbUrl = import.meta.env.PB_URL;
        if (!pbUrl) {
            console.error("❌ PB_URL not defined");
            return new Response(JSON.stringify({ error: "PB_URL not configured" }), { status: 500 });
        }

        const { items, infos } = (await request.json()) as {
            items?: PanierItem[];
            infos?: CommandeInfos;
        };
        if (!Array.isArray(items) || items.length === 0) {
            return new Response(JSON.stringify({ error: "Panier vide" }), { status: 400 });
        }

        const line_items: Array<{
            price_data: {
                currency: "eur";
                product_data: { name: string };
                unit_amount: number;
            };
            quantity: number;
        }> = [];

        let total = 0;

        // Appliquer l'offre : 1 pizza + 1 boisson = 10€
        const hasPizza = items.some((item) => item.type === "pizza" && item.quantite === 1);
        const hasBoisson = items.some((item) => item.type === "boisson" && item.quantite === 1);
        const totalItems = items.length;
        const isPromoApplicable = hasPizza && hasBoisson && totalItems === 2;

        if (isPromoApplicable) {
            // Si promo s'applique, créer un item unique à 10€
            line_items.push({
                price_data: {
                    currency: "eur",
                    product_data: { name: "Offre spéciale: 1 pizza + 1 boisson" },
                    unit_amount: 1000, // 10€ en centimes
                },
                quantity: 1,
            });
            total = 10;
        } else {
            // Sinon, ajouter chaque item individuellement
            for (const item of items) {
                const qte = Math.max(1, Number(item.quantite || 1));
                const collection = item.type === "pizza" ? "pizzas" : "boissons";

                let produit;
                try {
                    produit = await pb.collection(collection).getOne(item.id);
                } catch (pbErr) {
                    console.error(`❌ Erreur PocketBase pour ${collection} ${item.id}:`, pbErr);
                    return new Response(JSON.stringify({ error: `Produit ${item.nom} introuvable` }), { status: 404 });
                }

                const prix = Number(produit.prix || 0);
                const unitAmount = Math.round(prix * 100);

                total += prix * qte;

                line_items.push({
                    price_data: {
                        currency: "eur",
                        product_data: { name: produit.nom || "Produit" },
                        unit_amount: unitAmount,
                    },
                    quantity: qte,
                });
            }
        }

        // Créer la commande immédiatement avec statut "en attente"
        console.log("📝 Création commande...", { total, infos });

        let commande;
        try {
            commande = await pb.collection("commandes").create({
                users_id: pb.authStore.model?.id ?? null,
                total,
                client_nom: infos ? `${infos.prenom} ${infos.nom}` : null,
                client_email: infos?.email || null,
                client_telephone: infos?.telephone || null,
                adresse_livraison: infos?.adresse || null,
                type_commande: infos?.type_commande || "livraison",
                date_commande: new Date().toISOString(),
                heure_souhaitee: infos?.heure_souhaitee || null,
                notes: infos?.notes || null,
                statut: "en attente",
                payment_status: "pending",
            });

            console.log("✅ Commande créée:", commande.id);
            // Items seront créés au webhook après paiement confirmé
        } catch (err) {
            console.error("❌ Erreur création commande:", err);
            throw err;
        }

        const baseUrl = import.meta.env.PUBLIC_BASE_URL || new URL(request.url).origin;

        // Préparer les items compacts pour les métadatas
        const itemsCompact = items.map((item) => `${item.type},${item.id},${item.nom},${item.quantite},${item.prix}`).join("|");

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items,
            success_url: `${baseUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/paiement/annule`,
            metadata: {
                commandeId: commande!.id,
                itemsCompact: itemsCompact,
            },
        });

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error("Erreur création session:", e);
        return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
    }
};
