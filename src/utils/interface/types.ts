export interface IUser {
	name: string;
	email: string;
	stripeId: string | null;
	fireId: string;
}

export interface ISubscriptionData {
	id: string;
	client_secret: string;
}
