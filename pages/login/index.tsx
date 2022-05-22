import React, { useContext, useState } from "react";
import Link from "next/link";
import { AuthContext } from "src/contexts/auth";
import { Button } from "antd";
import { AuthContextTypes } from "src/utils/interface/types";

const Login = () => {
	const { signIn, error } = useContext(AuthContext) as AuthContextTypes;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	function onSubmit() {
		signIn(email, password);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
			}}
		>
			<h2>Login</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "15px",
					width: "20%",
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
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					required
				/>
				<Button type="primary" htmlType="submit">
					Login
				</Button>
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
				Dont&apos;t have an account?{" "}
				<Link href="/signup" style={{ color: "blue" }}>
					Sign Up
				</Link>
			</p>
			<p style={{ fontWeight: "bold" }}>
				Checkout our{" "}
				<Link href="/pricing-page" style={{ color: "blue" }}>
					Products
				</Link>
			</p>
		</div>
	);
};

export default Login;
