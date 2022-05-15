import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "src/contexts/auth";
import { Steps, Button, message } from "antd";
import SignUpForm from "src/components/sign-up-form";
import AlmostThereForm from "src/components/almost-there-form";

const { Step } = Steps;

const SignUp = () => {
	const { firebaseUser, dbUser, error } = useContext(AuthContext);
	const [current, setCurrent] = useState(0);
	const [loadingStep, setLoadingStep] = useState(false);

	useEffect(() => {
		if (firebaseUser) {
			setCurrent(1);
		}

		if (dbUser) {
			setCurrent(2);
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
		{
			title: "Done",
			content: <div>DONE!</div>,
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
					}}
				>
					{steps[current].content}
				</div>
				{/* 		<div className="steps-action">
				{current < steps.length - 1 && (
					<Button type="primary" onClick={() => next()}>
						Next
					</Button>
				)}
				{current === steps.length - 1 && (
					<Button
						type="primary"
						onClick={() => message.success("Processing complete!")}
					>
						Done
					</Button>
				)}
				{current > 0 && (
					<Button style={{ margin: "0 8px" }} onClick={() => prev()}>
						Previous
					</Button>
				)}
			</div> */}
			</div>
		</div>
	);
};

export default SignUp;
