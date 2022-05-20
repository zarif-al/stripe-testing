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

		const { customerId } = req.body;

		try {
			if (!customerId) {
				res.status(500).json({ success: false, error: "Invalid Data." });
			}

			try {
				const session: Stripe.BillingPortal.Session =
					await stripe.billingPortal.sessions.create({
						customer: customerId,
						return_url: "http://localhost:3000/",
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
