// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import {
	ApiError,
	StripeProductsResponse,
} from "src/utils/interface/responses";

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
	apiVersion: "2020-08-27",
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		if (!stripe) {
			res.status(500).json({ error: "Stripe not loaded" });
		} else {
			const productId = req.query.id;
			const product = await stripe.products.retrieve(productId as string);
			res.status(200).json(product);
		}
	} else {
		res.setHeader("Allow", "GET");
		res.status(405).end("Method Not Allowed");
	}
}
