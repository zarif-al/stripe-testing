import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
	apiVersion: "2020-08-27",
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		const paymentIntentId = req.query.payment_intent;
		try {
			if (!paymentIntentId) {
				res.status(500).json({ error: "No Payment Intent Id Provided." });
			}
			const paymentIntent: Stripe.PaymentIntent =
				await stripe.paymentIntents.retrieve(paymentIntentId as string);

			res.status(200).json({ success: true, status: paymentIntent.status });
		} catch (err: any) {
			res
				.status(500)
				.json({ success: false, statusCode: 500, message: err.message });
		}
	} else {
		res.setHeader("Allow", "GET");
		res.status(405).end("Method Not Allowed");
	}
}
