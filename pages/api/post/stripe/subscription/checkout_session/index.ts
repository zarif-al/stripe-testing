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

			try {
				const session: Stripe.Checkout.Session =
					await stripe.checkout.sessions.create({
						mode: "subscription",
						customer: customerId,
						line_items: [
							{
								price: priceId,
								// For metered billing, do not pass quantity
								quantity: 1,
							},
						],
						success_url: "http://localhost:3000/?session_id={CHECKOUT_SESSION_ID}",
						cancel_url: "http://localhost:3000/pricing-page",
					});

				res.json({ success: true, session_url: session.url });
			} catch (err: any) {
				console.log(err);
				res.status(500).json({ success: false, error: err });
			}
		} catch (err: any) {
			res.status(500).json({ success: false, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
