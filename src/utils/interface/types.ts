export interface IUser {
	name: string;
	email: string;
	stripeId: string;
	fireId: string;
	subscriptionId: string | null;
	subscriptionStatus: string | null;
	productId: string | null;
	cancelAtPeriodEnd: boolean;
}

export interface ISubscriptionData {
	id: string;
	client_secret: string;
}
