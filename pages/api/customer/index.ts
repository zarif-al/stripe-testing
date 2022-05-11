import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { auth, db } from "src/auth/Firebase";

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY!, {
	apiVersion: "2020-08-27",
});

interface Customer extends Stripe.Customer {
	subscriptions: Stripe.ApiList<Stripe.Subscription>;
}

interface DeletedCustomer extends Stripe.DeletedCustomer {
	subscriptions: Stripe.ApiList<Stripe.Subscription>[];
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const body = JSON.parse(req.body);

		const customer_id: string = body.customer_id;
		try {
			if (!customer_id) {
				res.status(500).json({ error: "No Customer Id Provided." });
			}

			// FIX LATER
			const customer: any = await stripe.customers.retrieve(customer_id, {
				expand: ["subscriptions"],
			});

			res.status(200).json({
				productId: customer.subscriptions.data[0].items.data[0].plan.product,
			});
		} catch (err: any) {
			res.status(500).json({ statusCode: 500, message: err.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
