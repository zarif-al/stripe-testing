// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { ApiError } from "src/utils/interface/responses";

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
	apiVersion: "2020-08-27",
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Stripe.Price | ApiError>
) {
	if (req.method === "GET") {
		const { id } = req.query;
		if (!stripe) {
			res.status(500).json({ error: "Stripe not loaded" });
		} else if (!id) {
			res.status(400).json({ error: "No id provided" });
		} else {
			const products = await stripe.prices.retrieve(id as string);
			res.status(200).json(products);
		}
	} else {
		res.setHeader("Allow", "GET");
		res.status(405).end("Method Not Allowed");
	}
}
