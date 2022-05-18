import React, { useState, useEffect } from "react";
import {
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { Button } from "antd";

interface PaymentFormProps {
	ready: boolean;
	setReady: (ready: boolean) => void;
}

function PaymentForm({ ready, setReady }: PaymentFormProps): JSX.Element {
	const stripe = useStripe();
	const elements = useElements();

	const [message, setMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.SyntheticEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			// Stripe.js has not yet loaded.
			// Make sure to disable form submission until Stripe.js has loaded.
			return;
		}

		setIsLoading(true);

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				// Make sure to change this to your payment completion page
				return_url: "http://localhost:3000/payment_status",
			},
		});

		// This point will only be reached if there is an immediate error when
		// confirming the payment. Otherwise, your customer will be redirected to
		// your `return_url`. For some payment methods like iDEAL, your customer will
		// be redirected to an intermediate site first to authorize the payment, then
		// redirected to the `return_url`.
		if (
			error.message &&
			(error.type === "card_error" || error.type === "validation_error")
		) {
			setMessage(error.message);
		} else {
			setMessage("An unexpected error occured.");
		}

		setIsLoading(false);
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "300px",
				position: "relative",
			}}
		>
			{!stripe && <p>Stripe Error</p>}
			{stripe && !ready && <p>Loading...</p>}
			<form
				onSubmit={handleSubmit}
				style={{
					display: ready ? "flex" : "none",
					flexDirection: "column",
					alignItems: "center",
					gap: "8px",
				}}
			>
				<PaymentElement
					id="payment-element"
					onReady={() => {
						setReady(true);
					}}
				/>

				{!isLoading && stripe && elements && ready && (
					<Button type="primary" id="submit" htmlType="submit">
						<span id="button-text">{isLoading ? <div>Loading</div> : "Pay now"}</span>
					</Button>
				)}
				{message && <div id="payment-message">{message}</div>}
			</form>
		</div>
	);
}

export default PaymentForm;
