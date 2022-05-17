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

const subscriptionWebhookHandler = async (
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

		if (
			event.type === "customer.subscription.created" ||
			event.type === "customer.subscription.updated" ||
			event.type === "customer.subscription.deleted"
		) {
			const subscription = event.data.object as Stripe.Subscription;
			const productId = subscription.items.data[0].price.product;
			const stripeId = subscription.customer;
			const subscriptionStatus = subscription.status;

			// Update user in db with subscription id, product id and subscription status
			const user = await User.findOneAndUpdate(
				{ stripeId },
				{
					subscriptionId: subscription.id,
					productId,
					subscriptionStatus,
				}
			);
			if (user.length === 0) {
				console.log("User Not Found");
			} else {
				console.log("Update Success");
			}
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
};

export default cors(subscriptionWebhookHandler as any);
