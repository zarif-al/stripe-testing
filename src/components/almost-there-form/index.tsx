import React, { useContext, useState } from "react";
import Link from "next/link";
import { AuthContext } from "src/contexts/auth";
import { Button } from "antd";

interface FormProps {
	setLoadingStep: (bool: boolean) => void;
}

function AlmostThereForm({ setLoadingStep }: FormProps) {
	const { createMongoDBUser, error } = useContext(AuthContext);
	const [name, setName] = useState("");

	function onSubmit() {
		setLoadingStep(true);
		createMongoDBUser(name);
	}

	return (
		<>
			<h2>Almost There</h2>
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
					placeholder="Name"
					name="fname"
					style={{ padding: "0.4rem" }}
					value={name}
					onChange={(e) => {
						setName(e.target.value);
					}}
					required
				/>
				<Button htmlType="submit" type="primary">
					Complete Sign Up
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
				Already have an account? <Link href="/login">Login</Link>
			</p>
		</>
	);
}

export default AlmostThereForm;
