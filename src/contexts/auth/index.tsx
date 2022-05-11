import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "src/auth/Firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	User,
	UserCredential,
	deleteUser,
	onAuthStateChanged,
} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/router";

interface Props {
	children: React.ReactNode;
	route: string;
}

interface IUser {
	name: string;
	email: string;
	stripeID: string | null;
	fireId: string;
}

export const AuthContext = createContext({
	createFirebaseUser: (name: string, email: string, password: string) => {},
	signIn: (email: string, password: string): void => {},
	signOut: () => {},
	error: {} as string | null,
	setError: (error: string | null) => {},
	user: {} as IUser | undefined,
});

export default function AuthContextProvider({
	children,
	route,
}: Props): JSX.Element {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(
		undefined
	);
	const [error, setError] = useState<string | null>(null);

	async function AddToDb(user: IUser, user_auth: User): Promise<void> {
		try {
			await addDoc(collection(db, "users"), user);
			setError(null);
			router.push("/");
		} catch (e: any) {
			deleteUser(user_auth);
			setError("Failed to add user to database");
		}
	}

	async function createFirebaseUser(
		name: string,
		email: string,
		password: string
	): Promise<void> {
		await createUserWithEmailAndPassword(auth, email, password)
			.then(async (userCredential: UserCredential) => {
				const user_auth = userCredential.user;
				const user_db: IUser = {
					name,
					email,
					stripeID: null,
					fireId: user_auth.uid,
				};
				await AddToDb(user_db, user_auth);
			})
			.catch((createUserError) => {
				if (createUserError.code === "auth/email-already-in-use") {
					setError("This email address is already registered.");
				} else if (createUserError.code === "auth/invalid-email") {
					setError("This email address is invalid.");
				} else if (createUserError.code === "auth/operation-not-allowed") {
					setError("Operation not allowed. Please contact support.");
				} else if (createUserError.code === "auth/weak-password") {
					setError("Please use a stronger password");
				}
			});
	}

	async function signIn(email: string, password: string): Promise<void> {
		await signInWithEmailAndPassword(auth, email, password)
			.then(() => {
				setError(null);
				router.push("/");
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
	}

	// Auth state change listener
	onAuthStateChanged(auth, (user: User | null) => {
		if (user) {
			setFirebaseUser(user);
		} else {
			setFirebaseUser(null);
		}
	});

	useEffect(() => {
		setError(null);
		if (firebaseUser === undefined) {
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
			(router.pathname === "/login" || router.pathname === "/signup")
		) {
			router.push("/");
		}
	}, [route, router, firebaseUser]);

	function Loader(): JSX.Element {
		return <div>Loading...</div>;
	}

	return (
		<AuthContext.Provider
			value={{
				createFirebaseUser,
				signIn,
				signOut,
				error,
				setError,
				user: undefined,
				/* 	onCreateUser, */
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
