import React, { useState, useEffect } from "react";
import getStripe from "src/utils/stripe";

const stripe = getStripe();

function PaymentStatus() {
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!stripe) {
			return;
		}

		const clientSecret = new URLSearchParams(window.location.search).get(
			"payment_intent_client_secret"
		);

		if (!clientSecret) {
			return;
		}

		stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
			switch (paymentIntent?.status) {
				case "succeeded":
					setMessage("Payment succeeded!");
					break;
				case "processing":
					setMessage("Your payment is processing.");
					break;
				case "requires_payment_method":
					setMessage("Your payment was not successful, please try again.");
					break;
				default:
					setMessage("Something went wrong.");
					break;
			}
		});
	}, [stripe]);

	return (
		<div
			style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
		>
			{message}
		</div>
	);
}

export default PaymentStatus;
