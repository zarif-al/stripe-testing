import React, { useContext, useState } from "react";
import Link from "next/link";
import { AuthContext } from "src/contexts/auth";

interface FormProps {
	setLoadingStep: (bool: boolean) => void;
}

function SignUpForm({ setLoadingStep }: FormProps) {
	const { createFirebaseUser, error } = useContext(AuthContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	function onSubmit() {
		setLoadingStep(true);
		createFirebaseUser(email, password);
	}
	return (
		<>
			<h2>Sign Up</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "15px",
					width: "100%",
				}}
			>
				<input
					type="text"
					placeholder="Email"
					style={{ padding: "0.4rem" }}
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					style={{ padding: "0.4rem" }}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					required
				/>
				<button type="submit" style={{ padding: "0.4rem", cursor: "pointer" }}>
					Sign Up
				</button>
				<p
					style={{
						textAlign: "center",
						margin: "2px 0px",
						fontWeight: "500",
						color: "red",
					}}
				>
					{error}
				</p>
			</form>
			<p>
				Already have an account? <Link href="/login">Login</Link>
			</p>
		</>
	);
}

export default SignUpForm;
