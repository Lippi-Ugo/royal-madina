import type { APIRoute } from "astro";
import PocketBase from 'pocketbase';
import { stripe } from "../../../lib/stripe";
import twilio from 'twilio';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) return new Response("Signature manquante", { status: 400 });

    try {
        const payload = await request.text();
        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            import.meta.env.STRIPE_WEBHOOK_SECRET,
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            console.log("✅ Webhook reçu - Session complétée:", session.id);
            console.log("📦 Métadatas:", session.metadata);

            try {
                const commandeId = session.metadata?.commandeId;
                const itemsCompact = session.metadata?.itemsCompact || "";

                console.log("📝 Commande ID reçu:", commandeId);

                if (commandeId && itemsCompact) {
                    // Créer une instance PocketBase admin
                    const pb = new PocketBase(import.meta.env.PB_URL);
                    await pb.admins.authWithPassword(
                        import.meta.env.PB_ADMIN_EMAIL,
                        import.meta.env.PB_ADMIN_PASSWORD
                    );

                    // Parser les items compacts: "type,id,nom,quantite,prix|..."
                    const items = itemsCompact.split("|").map((itemStr) => {
                        const parts = itemStr.split(",");
                        return {
                            type: parts[0],
                            id: parts[1],
                            nom: parts[2],
                            quantite: Number(parts[3]),
                            prix: Number(parts[4]),
                        };
                    });

                    console.log("🛒 Items à créer:", items);

                    // UPDATE la commande
                    const updated = await pb.collection("commandes").update(commandeId, {
                        statut: "confirmée",
                        payment_status: "succeeded",
                        stripe_session_id: session.id,
                        stripe_session_intent: String(session.payment_intent || ""),
                    });

                    console.log("✅ Commande mise à jour:", commandeId, updated.statut);

                    // CRÉER les items de la commande maintenant que le paiement est confirmé
                    for (const item of items) {
                        await pb.collection("items_commande").create({
                            commande: commandeId,
                            produit_nom: item.nom,
                            quantite: item.quantite,
                            prix_unitaire: item.prix,
                        });
                    }

                    console.log("✅ Items créés pour la commande");

                    // Construire le détail des items pour le SMS
                    const itemsDetail = items
                        .map(item => `${item.quantite}x ${item.nom}`)
                        .join(" + ");

                    // Envoyer SMS via Twilio (ou simuler en dev sans numéro acheté)
                    try {
                        const messageText = `🍕 Commande #${commandeId} - ${updated.client_nom}\n${itemsDetail}\nLivraison: ${updated.heure_souhaitee}`;

                        if (import.meta.env.DEV) {
                            // En dev: simuler l'envoi (pas de numéro Twilio acheté)
                            console.log("📱 [SIM] SMS simulé (mode dev sans numéro acheté)");
                            console.log("📱 [SIM] DE:", import.meta.env.TWILIO_OWNER_PHONE_NUMBER);
                            console.log("📱 [SIM] À:", import.meta.env.TWILIO_PHONE_NUMBER);
                            console.log("📱 [SIM] Contenu:", messageText);
                        } else {
                            // En prod: envoyer vraiment le SMS
                            const client = twilio(
                                import.meta.env.TWILIO_ACCOUNT_SID,
                                import.meta.env.TWILIO_AUTH_TOKEN
                            );

                            await client.messages.create({
                                body: messageText,
                                from: import.meta.env.TWILIO_OWNER_PHONE_NUMBER,
                                to: import.meta.env.TWILIO_PHONE_NUMBER,
                            });

                            console.log("📱 SMS envoyé de:", import.meta.env.TWILIO_OWNER_PHONE_NUMBER);
                            console.log("📱 SMS vers:", import.meta.env.TWILIO_PHONE_NUMBER);
                        }

                        // Marquer le SMS comme envoyé dans PocketBase
                        await pb.collection("commandes").update(commandeId, {
                            sms_envoye: true,
                        });

                        console.log("✅ Colonne sms_envoyée mise à true");
                    } catch (smsErr) {
                        console.error("⚠️ Erreur envoi SMS:", smsErr);
                        // Ne pas échouer le webhook si SMS échoue
                    }
                } else {
                    console.warn("⚠️ Données manquantes dans les métadatas!", { commandeId, itemsCompact });
                }
            } catch (err) {
                console.error("❌ Erreur traitement webhook:", err);
            }
        }

        if (event.type === "checkout.session.expired") {
            // Session expirée - on ne crée la commande que si paiement confirmé donc rien à faire
        }

        return new Response("ok", { status: 200 });
    } catch (e) {
        console.error("Erreur webhook:", e);
        return new Response("Webhook invalide", { status: 400 });
    }
};
