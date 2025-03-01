require("dotenv").config();
const express = require("express");
console.log("Clave de Stripe:", process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware para recibir datos en bruto (necesario para webhooks)
app.use(bodyParser.raw({ type: "application/json" }));

// Ruta del webhook
app.post("/webhook", (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("⚠️ Error en el webhook:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar diferentes eventos de Stripe
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        console.log(`💰 Pago recibido: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
    } else if (event.type === "charge.refunded") {
        console.log("🔄 Pago reembolsado:", event.data.object.id);
    }

    res.json({ received: true });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Webhook corriendo en http://localhost:${PORT}`);
});