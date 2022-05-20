import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Price from "src/components/price";
import Stripe from "stripe";
import { ApiError } from "src/utils/interface/responses";
import { ISubscriptionData, IUser } from "src/utils/interface/types";
import { Button } from "antd";
import { AuthContext } from "src/contexts/auth";
import { useRouter } from "next/router";
import TrialActivationModal from "src/components/trial-activation-modal";

interface ProductElementProps {
	product: Stripe.Product;
}

const Product = ({ product }: ProductElementProps): JSX.Element => {
	const router = useRouter();
	const { dbUser } = useContext(AuthContext);
	const [priceLoading, setPriceLoading] = useState<boolean>(true);
	const [priceError, setPriceError] = useState<ApiError | null>(null);
	const [price, setPrice] = useState<Stripe.Price | null>(null);
	const [subscriptionError, setSubscriptionError] = useState<string | null>(
		null
	);
	const [modalVisible, setModalVisible] = useState(false);

	async function CreateSubscription(
		user: IUser,
		price_id: string
	): Promise<void> {
		const subscription = await fetch("/api/post/stripe/subscription/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				priceId: price_id,
				customerId: user.stripeId,
			}),
		}).then((res) => res.json());

		if (subscription.success) {
			router.push(`/payment?client_secret=${subscription.clientSecret}`);
		} else {
			setSubscriptionError(subscription.message);
		}
	}

	async function UpdateSubscription(
		user: IUser,
		price_id: string
	): Promise<void> {
		const subscription = await fetch("/api/post/stripe/subscription/update", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				priceId: price_id,
				subscriptionId: user.subscriptionId,
			}),
		}).then((res) => res.json());

		if (subscription.success) {
			console.log("Subscription updated successfully");
		} else {
			setSubscriptionError(subscription.message);
		}
	}

	async function StartTrial(user: IUser, price_id: string): Promise<void> {
		setModalVisible(true);
		const subscription = await fetch(
			"/api/post/stripe/subscription/start-trial",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					priceId: price_id,
					customerId: user.stripeId,
				}),
			}
		).then((res) => res.json());

		if (subscription.success) {
			setModalVisible(true);
		} else {
			console.log(subscription.message);
		}
	}

	useEffect(() => {
		fetch("/api/get/stripe/price/" + product.default_price)
			.then((res) => res.json())
			.then((data: ApiError | Stripe.Price) => {
				if ("error" in data) {
					setPriceError(data);
				} else {
					setPrice(data);
				}
				setPriceLoading(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [product]);

	return (
		<>
			<div
				style={{
					border: "1px solid #ccc",
					borderRadius: "16px",
					padding: "4rem",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<h3 style={{ textAlign: "center" }}>{product.name}</h3>
				<p style={{ textAlign: "center" }}>{product.description}</p>
				<div style={{ display: "flex", justifyContent: "center" }}>
					{dbUser?.productId === product.id ? (
						<p>You are subscribed</p>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<Price
								priceLoading={priceLoading}
								priceError={priceError}
								price={price}
								product={product}
							/>
							{price && dbUser && (
								<Button
									type="primary"
									onClick={() => {
										if (
											dbUser?.subscriptionId &&
											dbUser.subscriptionStatus === "active"
										) {
											UpdateSubscription(dbUser, price.id);
										} else {
											CreateSubscription(dbUser, price.id);
										}
									}}
								>
									{dbUser.subscriptionStatus !== "active" && "Subscribe"}
									{dbUser.subscriptionStatus === "active" && "Switch to this plan"}
								</Button>
							)}
							{product.metadata.canTrial === "true" && price && dbUser && (
								<Button
									type="primary"
									onClick={() => {
										StartTrial(dbUser, price.id);
									}}
								>
									Start Trial
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
			<TrialActivationModal isModalVisible={modalVisible} />
		</>
	);
};

export default Product;
