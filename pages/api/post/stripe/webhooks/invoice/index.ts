import { buffer } from "micro";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import dbConnect from "src/db/mongo";
import User from "src/models/user";

/* 
TO TEST IN LOCAL
stripe login
stripe listen --forward-to localhost:3000/api/webhooks
THEN PROCEED TO MAKE A PAYMENT 
*/

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
	apiVersion: "2020-08-27",
});

const webhookSecret: string = process.env.NEXT_PRIVATE_STRIPE_WEBHOOK_KEY!;

// Stripe requires the raw body to construct the event.
export const config = {
	api: {
		bodyParser: false,
	},
};

const cors = Cors({
	allowMethods: ["POST", "HEAD"],
});

const invoiceWebhookHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	if (req.method === "POST") {
		const buf = await buffer(req);
		const sig = req.headers["stripe-signature"]!;

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
		} catch (err: any) {
			// On error, log and return the error message.
			console.log(`❌ Error message: ${err.message}`);
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}
		// Stripe recommends to send the response as soon as possible
		res.json({ received: true });

		if (event.type === "invoice.payment_succeeded") {
			const invoice = event.data.object as Stripe.Invoice;
			// Check billing_reason
			if (invoice.billing_reason === "subscription_create") {
				console.log("✅ Invoice Payment Succeeded: subscription_create");
				const subscriptionId = invoice.subscription;
				const paymentIntentId = invoice.payment_intent;

				const payment_intent = await stripe.paymentIntents.retrieve(
					paymentIntentId as string
				);

				console.log("Updating Payment Method");
				// Update default payment method
				/* 			const subscription = await stripe.subscriptions.update(subscription_id, {
					default_payment_method: payment_intent.payment_method,
				}); */
			}
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
};

export default cors(invoiceWebhookHandler as any);
