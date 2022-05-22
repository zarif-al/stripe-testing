import { User as FirebaseUser } from "firebase/auth";

export interface IUser {
	name: string;
	email: string;
	stripeId: string;
	fireId: string;
	subscriptionId: string | null;
	subscriptionStatus: string | null;
	productId: string | null;
	cancelAtPeriodEnd: boolean;
	activatedTrial: boolean;
}

export interface ISubscriptionData {
	id: string;
	client_secret: string;
}

export interface ISelectedProduct {
	priceId: string;
	trialMode: boolean;
}

export interface AuthContextTypes {
	createFirebaseUser: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => void;
	error: string | null;
	setError: (error: string | null) => void;
	firebaseUser: FirebaseUser | null | undefined;
	dbUser: IUser | null | undefined;
	createMongoDBUser: (name: string) => Promise<void>;
	getMongoUser: (firebaseId: string) => Promise<void>;
	selectedProduct: ISelectedProduct | null;
	setSelectedProduct: (product: ISelectedProduct | null) => void;
}
