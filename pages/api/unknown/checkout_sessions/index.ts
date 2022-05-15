import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
	apiVersion: "2020-08-27",
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const priceId: string = req.body.priceId;
		try {
			if (!priceId) {
				res.status(500).json({ error: "No Price Provided." });
			}
			const params: Stripe.Checkout.SessionCreateParams = {
				mode: "subscription",
				line_items: [
					{
						price: priceId,
						quantity: 1,
					},
				],
				success_url: `${req.headers.origin}/?success=true?&session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${req.headers.origin}/?success=false?&session_id={CHECKOUT_SESSION_ID}`,
			};

			const checkoutSession: Stripe.Checkout.Session =
				await stripe.checkout.sessions.create(params);

			res.redirect(303, checkoutSession.url as string);
		} catch (err: any) {
			res.status(500).json({ statusCode: 500, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
