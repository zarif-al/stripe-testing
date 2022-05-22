import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "src/contexts/auth";
import { Steps, Button, message } from "antd";
import SignUpForm from "src/components/sign-up-form";
import AlmostThereForm from "src/components/almost-there-form";
import Link from "next/link";
import { AuthContextTypes } from "src/utils/interface/types";

const { Step } = Steps;

const SignUp = () => {
	const { firebaseUser, dbUser, error } = useContext(
		AuthContext
	) as AuthContextTypes;
	const [current, setCurrent] = useState(0);
	const [loadingStep, setLoadingStep] = useState(false);

	useEffect(() => {
		if (firebaseUser) {
			setCurrent(1);
		}
	}, [firebaseUser, dbUser]);

	const steps = [
		{
			title: "Sign Up",
			content: <SignUpForm setLoadingStep={setLoadingStep} />,
		},
		{
			title: "Almost There",
			content: <AlmostThereForm setLoadingStep={setLoadingStep} />,
		},
	];

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
			<div
				style={{
					width: "600px",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Steps
					current={current}
					status={loadingStep ? "wait" : error ? "error" : "process"}
				>
					{steps.map((item) => (
						<Step key={item.title} title={item.title} />
					))}
				</Steps>
				<div
					className="steps-content"
					style={{
						display: "flex",
						flexDirection: "column",
						width: "400px",
						justifyContent: "center",
						alignItems: "center",
						marginTop: "20px",
					}}
				>
					{steps[current].content}
				</div>
				<p style={{ fontWeight: "bold" }}>
					Checkout our{" "}
					<Link href="/pricing-page" style={{ color: "blue" }}>
						Products
					</Link>
				</p>
			</div>
		</div>
	);
};

export default SignUp;
