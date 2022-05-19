import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

interface Invoice extends Stripe.Invoice {
	payment_intent: Stripe.PaymentIntent;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
			apiVersion: "2020-08-27",
		});

		const { priceId, subscriptionId } = req.body;

		try {
			if (!priceId || !subscriptionId) {
				res.status(500).json({ success: false, error: "Invalid Data." });
			}
			const subscription = await stripe.subscriptions.retrieve(subscriptionId);

			const updateObject: Stripe.SubscriptionUpdateParams = {
				items: [
					{
						id: subscription.items.data[0].id,
						price: priceId,
					},
				],
			};

			if (subscription.status === "trialing") {
				updateObject.trial_end = "now";
			}

			const updatedSubscription: Stripe.Subscription =
				await stripe.subscriptions.update(subscriptionId, updateObject);

			res.status(200).json({
				success: true,
			});
		} catch (err: any) {
			res.status(500).json({ success: false, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
