import React, { useContext, useState } from "react";
import Link from "next/link";
import { AuthContext } from "src/contexts/auth";

const Login = () => {
	const { signIn, error } = useContext(AuthContext);
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
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "15px",
					width: "40%",
				}}
			>
				<input type="text" placeholder="Email" style={{ padding: "0.4rem" }} />
				<input
					type="password"
					placeholder="Password"
					style={{ padding: "0.4rem" }}
				/>
				<button type="submit" style={{ padding: "0.4rem", cursor: "pointer" }}>
					Login
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
				Dont&apos;t have an account?{" "}
				<Link href="/signup" style={{ color: "blue" }}>
					Sign Up
				</Link>
			</p>
		</div>
	);
};

export default Login;
