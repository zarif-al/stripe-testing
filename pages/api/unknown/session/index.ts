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
		const body = JSON.parse(req.body);

		const session_id: string = body.session_id;
		try {
			if (!session_id) {
				res.status(500).json({ error: "No Session Id Provided." });
			}
			const session: Stripe.Checkout.Session =
				await stripe.checkout.sessions.retrieve(session_id);

			res.status(200).json({ customerId: session.customer });
		} catch (err: any) {
			res.status(500).json({ statusCode: 500, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
