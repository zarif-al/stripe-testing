import React, { createContext, useState, useEffect } from "react";
import { auth } from "src/auth/Firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	User as FirebaseUser,
	UserCredential,
	deleteUser,
	onAuthStateChanged,
} from "firebase/auth";
import { IUser, ISelectedProduct } from "src/utils/interface/types";
import { useRouter } from "next/router";

interface Props {
	children: React.ReactNode;
	route: string;
}

export const AuthContext = createContext({
	createFirebaseUser: (email: string, password: string) => {},
	signIn: (email: string, password: string): void => {},
	signOut: () => {},
	error: {} as string | null,
	setError: (error: string | null) => {},
	firebaseUser: {} as FirebaseUser | null | undefined,
	dbUser: {} as IUser | null | undefined,
	createMongoDBUser: (name: string) => {},
	getMongoUser: (user: FirebaseUser) => {},
	selectedProduct: {} as ISelectedProduct | null,
	setSelectedProduct: (product: ISelectedProduct | null) => {},
});

export default function AuthContextProvider({
	children,
	route,
}: Props): JSX.Element {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [firebaseUser, setFirebaseUser] = useState<
		FirebaseUser | null | undefined
	>(undefined);
	const [error, setError] = useState<string | null>(null);
	const [dbUser, setDbUser] = useState<IUser | null | undefined>(undefined);
	const [selectedProduct, setSelectedProduct] =
		useState<ISelectedProduct | null>(null);
	async function createMongoDBUser(name: string): Promise<void> {
		try {
			// First Create Stripe User
			// TODO : If customer with this email exists in stripe then get that or delete it.
			// Under normal circumstances this should not happen. This can only happen if user is deleted from
			// MongoDB
			const stripeUser = await fetch("/api/post/stripe/customer/create", {
				method: "POST",
				body: JSON.stringify({
					name: name,
					email: firebaseUser!.email,
				}),
				headers: new Headers({
					"Content-Type": "application/json",
					Accept: "application/json",
				}),
			}).then((res) => res.json());

			if (!stripeUser.success) {
				setError("Failed to create Stripe User");
				return;
			}

			// Create MongoUser
			const newUser: IUser = {
				name: name,
				email: firebaseUser!.email!,
				fireId: firebaseUser!.uid,
				stripeId: stripeUser.customer_id,
				subscriptionId: null,
				subscriptionStatus: null,
				productId: null,
				cancelAtPeriodEnd: false,
				activatedTrial: false,
			};

			const user = await fetch("/api/post/user/create", {
				method: "POST",
				body: JSON.stringify(newUser),
				headers: new Headers({
					"Content-Type": "application/json",
					Accept: "application/json",
				}),
			}).then((res) => res.json());

			if (!user.success) {
				setError("Failed to create Mongo User");
				return;
			}

			setDbUser(user.data[0]);
		} catch (e: any) {
			console.log(e);
			setError(e.message);
		}
	}

	async function getMongoUser(user: FirebaseUser): Promise<void> {
		try {
			const mongoUser = await fetch(`/api/get/mongo-user/${user.uid}`).then(
				(res) => res.json()
			);

			if (mongoUser.success == true) {
				setDbUser(mongoUser.data);
			} else {
				setDbUser(null);
			}

			if (mongoUser.error !== undefined) {
				setDbUser(null);
				setError(mongoUser.error);
			}
		} catch (e) {
			console.log(e);
		}
	}

	async function createFirebaseUser(
		email: string,
		password: string
	): Promise<void> {
		await createUserWithEmailAndPassword(auth, email, password).catch(
			(createUserError) => {
				if (createUserError.code === "auth/email-already-in-use") {
					setError("This email address is already registered.");
				} else if (createUserError.code === "auth/invalid-email") {
					setError("This email address is invalid.");
				} else if (createUserError.code === "auth/operation-not-allowed") {
					setError("Operation not allowed. Please contact support.");
				} else if (createUserError.code === "auth/weak-password") {
					setError("Please use a stronger password");
				}
			}
		);
	}

	async function signIn(email: string, password: string): Promise<void> {
		await signInWithEmailAndPassword(auth, email, password)
			.then(() => {
				setError(null);
			})
			.catch((signInError) => {
				if (
					signInError.code === "auth/firebaseUser-not-found" ||
					signInError.code === "auth/user-not-found"
				) {
					setError("Provided email address is not registered.");
				} else if (signInError.code === "auth/wrong-password") {
					setError("Provided email address/password does not match.");
				} else if (signInError.code === "auth/invalid-email") {
					setError("Provided email address is invalid.");
				} else {
					setError("Your account is disabled. Please contact support.");
				}
			});
	}

	async function signOut(): Promise<void> {
		await auth.signOut().catch((signOutError) => {
			setError(signOutError.code);
		});
		setDbUser(undefined);
	}

	// Auth state change listener
	onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
		if (user) {
			setFirebaseUser(user);
		} else {
			setFirebaseUser(null);
		}
	});

	useEffect(() => {
		setError(null);

		async function fetchMongoUser() {
			if (firebaseUser) {
				await getMongoUser(firebaseUser);
			}
		}

		if (firebaseUser === undefined && dbUser === undefined) {
			Loader();
		}

		if (
			firebaseUser === null &&
			router.pathname !== "/login" &&
			router.pathname !== "/signup"
		) {
			router.push("/login");
		}

		if (
			firebaseUser !== null &&
			firebaseUser !== undefined &&
			dbUser === undefined
		) {
			fetchMongoUser();
		}

		if (
			firebaseUser !== null &&
			firebaseUser !== undefined &&
			dbUser === null &&
			router.pathname !== "/signup"
		) {
			router.push("/signup");
		}

		if (
			firebaseUser !== null &&
			dbUser !== null &&
			firebaseUser !== undefined &&
			dbUser !== undefined &&
			(router.pathname === "/signup" ||
				router.pathname === "/login" ||
				router.pathname === "/pricing-page")
		) {
			if (selectedProduct) {
				router.push("/redirect");
			} else {
				router.push("/");
			}
		}
	}, [
		route,
		router,
		firebaseUser,
		dbUser,
		selectedProduct,
		setSelectedProduct,
		setError,
	]);

	useEffect(() => {
		const price_id = new URLSearchParams(window.location.search).get("price_id");
		const trialMode = new URLSearchParams(window.location.search).get("trial");
		if (price_id) {
			if (trialMode === "true") {
				setSelectedProduct({ priceId: price_id, trialMode: true });
			} else {
				setSelectedProduct({ priceId: price_id, trialMode: false });
			}
		}
	}, [setSelectedProduct]);

	function Loader(): JSX.Element {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				Loading...
			</div>
		);
	}

	return (
		<AuthContext.Provider
			value={{
				createFirebaseUser,
				signIn,
				signOut,
				error,
				setError,
				firebaseUser,
				dbUser,
				createMongoDBUser,
				getMongoUser,
				selectedProduct,
				setSelectedProduct,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
