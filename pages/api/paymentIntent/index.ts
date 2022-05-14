import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { auth, db } from "src/auth/Firebase";

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
	apiVersion: "2020-08-27",
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const price: string = req.body.price;
		try {
			const paymentIntent = await stripe.paymentIntents.create({
				amount: Number(price),
				currency: "usd",
				automatic_payment_methods: { enabled: true },
			});
			res.status(200).json({ clientSecret: paymentIntent.client_secret });
		} catch (err: any) {
			res.status(500).json({ statusCode: 500, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
