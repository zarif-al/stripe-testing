import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { ISubscriptionData } from "src/utils/interface/types";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Appearance } from "@stripe/stripe-js";
import getStripe from "src/utils/stripe";
import PaymentForm from "src/components/payment-form";

interface ModalProps {
	isModalVisible: boolean;
	onCancel: () => void;
	subscription: ISubscriptionData | null;
	subscriptionError: string | null;
}

const stripePromise = getStripe();

function CheckoutModal({
	isModalVisible,
	onCancel,
	subscription,
	subscriptionError,
}: ModalProps) {
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (subscription !== null) {
			setClientSecret(subscription.client_secret);
		}
	}, [subscription]);

	const appearance = {
		theme: "stripe",
	} as Appearance;

	return (
		<Modal
			title="Basic Modal"
			visible={isModalVisible}
			footer={null}
			onCancel={onCancel}
			centered
			closable={!ready ? false : true}
		>
			{!clientSecret && (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "300px",
					}}
				>
					Loading...
				</div>
			)}
			{clientSecret && stripePromise && (
				<Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
					<PaymentForm ready={ready} setReady={setReady} />
				</Elements>
			)}
			{subscriptionError && <p>{subscriptionError}</p>}
		</Modal>
	);
}

export default CheckoutModal;
