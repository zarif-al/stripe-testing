import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "src/utils/stripe";
import PaymentForm from "src/components/payment-form";
import { useRouter } from "next/router";
import { Appearance } from "@stripe/stripe-js";
import Link from "next/link";

const stripePromise = getStripe();

function PaymentPage() {
	const router = useRouter();
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	useEffect(() => {
		const clientSecret = new URLSearchParams(window.location.search).get(
			"client_secret"
		);

		if (clientSecret) {
			setClientSecret(clientSecret);
		} else {
			router.push("/");
		}
	}, [router]);

	const appearance = {
		theme: "stripe",
	} as Appearance;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				height: "90vh",
				position: "relative",
			}}
		>
			<div style={{ position: "absolute", top: 10, left: 15 }}>
				<Link href="/"> Back</Link>
			</div>

			{!clientSecret && (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "300px",
					}}
				>
					Loading...
				</div>
			)}
			{clientSecret && stripePromise && (
				<Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
					<PaymentForm />
				</Elements>
			)}
		</div>
	);
}

export default PaymentPage;
