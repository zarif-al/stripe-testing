import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
			apiVersion: "2020-08-27",
		});

		const { email, name } = req.body;

		try {
			if (!email || !name) {
				res
					.status(500)
					.json({ success: false, error: "No Customer Data Provided." });
			}

			const customer: Stripe.Customer = await stripe.customers.create({
				name,
				email,
			});
			res.status(200).json({ success: true, customer_id: customer.id });
		} catch (err: any) {
			res.status(500).json({ success: false, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
