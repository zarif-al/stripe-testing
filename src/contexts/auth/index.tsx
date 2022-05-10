import React, { createContext, useState, useEffect } from "react";
import { User } from "@firebase/auth-types";
import { auth, db } from "src/auth/Firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

interface Props {
	children: React.ReactNode;
	route: string;
}

interface IUser {
	name: string;
	email: string;
	stripeID: string | null;
}

export const AuthContext = createContext({
	createFirebaseUser: (email: string, password: string) => {},
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
	const [loading, setLoading] = useState(true);
	const [firebaseUser, setFirebaseUser] = useState<User | null>();
	const [error, setError] = useState<string | null>(null);

	async function getCurrentUser() {
		const user = await auth.currentUser;
		console.log(user);
		/* 		try {
			const docRef = await addDoc(collection(db, "users"), {
				first: "Ada",
				last: "Lovelace",
				born: 1815,
			});
			console.log("Document written with ID: ", docRef.id);
		} catch (e) {
			console.error("Error adding document: ", e);
		} */
	}

	// async function onCreateUser(input: onCreateUserInput): Promise<void> {
	// Create user in mongodb
	// }

	async function createFirebaseUser(
		email: string,
		password: string
	): Promise<void> {
		await createUserWithEmailAndPassword(auth, email, password)
			.then(() => {
				setError(null);
			})
			.catch((createUserError) => {
				if (createUserError.code === "auth/email-already-in-use") {
					setError("This email address is already registered.");
				} else if (createUserError.code === "auth/invalid-email") {
					setError("This email address is invalid.");
				} else if (createUserError.code === "auth/operation-not-allowed") {
					setError("Operation not allowed. Please contact support.");
				} else {
					setError("Please use a stronger password");
				}
			});
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
		await signOut().catch((signOutError) => {
			setError(signOutError.code);
		});
	}

	function onAuthStateChanged(authUser: User | null) {
		setFirebaseUser(authUser);
		setError(null);
	}

	useEffect(() => {
		setError(null);
		getCurrentUser();
	}, [route]);

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
