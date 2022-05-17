import Stripe from "stripe";

export interface ApiError {
	error: string;
}

export type StripeProductsResponse = Stripe.ApiList<Stripe.Product>;

export interface IPaymentStatus {
	success: boolean;
	status: string;
}
