export interface IUser {
	name: string;
	email: string;
	stripeId: string | null;
	fireId: string;
	subscriptionId: string | null;
	subscriptionStatus: string | null;
	productId: string | null;
}

export interface ISubscriptionData {
	id: string;
	client_secret: string;
}
