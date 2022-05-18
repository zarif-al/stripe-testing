import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "src/contexts/auth";
import Stripe from "stripe";
import { IUser } from "src/utils/interface/types";

// TODO : WORK ON HERE

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
	const { dbUser } = useContext(AuthContext);
	const [loading, setLoading] = useState(false);
	const [product, setProduct] = useState<Stripe.Product | null>(null);
	const [subscription, setSubscription] = useState<Stripe.Subscription | null>(
		null
	);

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
		}
	}, [product, subscription]);

	// If no subscription id is found, then the user is not subscribed to anything
	if (dbUser && !dbUser.subscriptionId) {
		return <Container>You have no active subscription</Container>;
	}

	if (loading) {
		return <Container>Loading...</Container>;
	}

	if (!loading && product && subscription) {
		return <Container>You are subscribed</Container>;
	}
}

export default MySubscription;
