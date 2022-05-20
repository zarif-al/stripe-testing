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

		const { priceId, customerId } = req.body;

		try {
			if (!priceId || !customerId) {
				res.status(500).json({ success: false, error: "Invalid Data." });
			}

			const subscription: Stripe.Subscription = await stripe.subscriptions.create({
				customer: customerId,
				items: [
					{
						price: priceId,
					},
				],
				trial_period_days: 14,
			});

			res.status(200).json({
				success: true,
				subscriptionId: subscription.id,
			});
		} catch (err: any) {
			res.status(500).json({ success: false, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
