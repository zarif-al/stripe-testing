import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "src/contexts/auth";
import Stripe from "stripe";
import { IUser } from "src/utils/interface/types";
import { Button } from "antd";
import { useRouter } from "next/router";

// TODO : Cancel Subscription -> Complete
// TODO : Pause Subscription -> Incomplete
// TODO : Resume Subscription -> Incomplete

interface ContainerProps {
	children: React.ReactNode;
}

function Container({ children }: ContainerProps) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "90vh",
			}}
		>
			<div
				style={{
					padding: "20px",
					border: "1px solid #ccc",
					borderRadius: "5px",
				}}
			>
				{children}
			</div>
		</div>
	);
}

function MySubscription() {
	const router = useRouter();
	const { dbUser } = useContext(AuthContext);
	const [loading, setLoading] = useState(false);
	const [product, setProduct] = useState<Stripe.Product | null>(null);
	const [subscription, setSubscription] = useState<Stripe.Subscription | null>(
		null
	);

	async function cancelSubscription(subscriptionId: string) {
		setLoading(true);
		const subscriptionCancelled = await fetch(
			"/api/post/stripe/subscription/cancel",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					subscriptionId,
				}),
			}
		).then((res) => res.json());

		if (subscriptionCancelled.success === true) {
			router.reload();
		} else {
			console.log(subscriptionCancelled.error);
		}
	}

	async function abortCancelSubscription(subscriptionId: string) {
		setLoading(true);
		const subscriptionCancelled = await fetch(
			"/api/post/stripe/subscription/abort-cancellation",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					subscriptionId,
				}),
			}
		).then((res) => res.json());

		if (subscriptionCancelled.success === true) {
			router.reload();
		} else {
			console.log(subscriptionCancelled.error);
		}
	}

	async function getSubscription(user: IUser) {
		const subscription = await fetch(
			`/api/get/stripe/subscription/${user.subscriptionId}`
		).then((res) => res.json());

		setSubscription(subscription);
	}

	async function getProduct(user: IUser) {
		const product = await fetch(`/api/get/stripe/product/${user.productId}`).then(
			(res) => res.json()
		);

		setProduct(product);
	}

	useEffect(() => {
		if (dbUser && dbUser.subscriptionId) {
			setLoading(true);
			getSubscription(dbUser);
			getProduct(dbUser);
		}
	}, [dbUser]);

	useEffect(() => {
		if (product && subscription) {
			setLoading(false);
			console.log(subscription);
		}
	}, [product, subscription]);

	// If no subscription id is found, then the user is not subscribed to anything
	if (dbUser && !dbUser.subscriptionId) {
		return <Container>You have no active subscription</Container>;
	}

	if (loading) {
		return <Container>Loading...</Container>;
	}

	if (!loading && product && subscription && dbUser) {
		return (
			<Container>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					<span style={{ display: "flex", gap: "5px" }}>
						<p style={{ fontWeight: "bold" }}>Product Name: </p>
						<p>{product.name}</p>
					</span>
					<span style={{ display: "flex", gap: "5px" }}>
						<p style={{ fontWeight: "bold" }}>Subscription Creation: </p>
						<p>{new Date(subscription.created * 1000).toString()}</p>
					</span>
					<span style={{ display: "flex", gap: "5px" }}>
						<p style={{ fontWeight: "bold" }}>Subscription Status: </p>
						<p>{subscription.status}</p>
					</span>
					{dbUser.cancelAtPeriodEnd === true ? (
						<Button
							type="primary"
							onClick={() => {
								abortCancelSubscription(subscription.id);
							}}
						>
							Abort Cancellation
						</Button>
					) : (
						<Button
							danger
							type="primary"
							onClick={() => {
								cancelSubscription(subscription.id);
							}}
						>
							Cancel Subscription
						</Button>
					)}
				</div>
			</Container>
		);
	}
}

export default MySubscription;
