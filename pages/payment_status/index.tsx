import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { IPaymentStatus } from "src/utils/interface/responses";
function PaymentStatus() {
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	async function getPaymentStatus(paymentIntentId: string) {
		const paymentIntent: IPaymentStatus = await fetch(
			`/api/get/stripe/payment-status?payment_intent=${paymentIntentId}`
		).then((res) => res.json());

		if (paymentIntent.success === false) {
			setError("Failed to get payment status info");
		} else {
			switch (paymentIntent.status) {
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
		}
	}

	useEffect(() => {
		const paymentIntentId = new URLSearchParams(window.location.search).get(
			"payment_intent"
		);

		if (!paymentIntentId) {
			router.push("/");
		} else {
			getPaymentStatus(paymentIntentId);
		}
	}, [router]);

	useEffect(() => {
		if (message) {
			setTimeout(() => {
				router.push("/my_subscription");
			}, 3000);
		}
	}, [message]);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "90vh",
			}}
		>
			<h2>{message}</h2>
		</div>
	);
}

export default PaymentStatus;
