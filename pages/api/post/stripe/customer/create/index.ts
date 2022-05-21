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

			// TODO : Remove this when using production
			const customer: Stripe.Customer = await stripe.customers.create({
				name,
				email,
				test_clock: "clock_1L1nOWJNWcD21spcugGsuzA2",
				payment_method: "pm_card_visa",
				invoice_settings: { default_payment_method: "pm_card_visa" },
			});

			// TODO : Use this in production
			/* 		const customer: Stripe.Customer = await stripe.customers.create({
				name,
				email,
			}); */
			res.status(200).json({ success: true, customer_id: customer.id });
		} catch (err: any) {
			res.status(500).json({ success: false, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
