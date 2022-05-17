import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Price from "src/components/price";
import Stripe from "stripe";
import { ApiError } from "src/utils/interface/responses";
import { ISubscriptionData } from "src/utils/interface/types";
import { Button } from "antd";
import { AuthContext } from "src/contexts/auth";
import CheckoutModal from "src/components/checkout-modal";

interface ProductElementProps {
	product: Stripe.Product;
	subscribedProduct: string | undefined;
}

const Product = ({
	product,
	subscribedProduct,
}: ProductElementProps): JSX.Element => {
	const { dbUser } = useContext(AuthContext);
	const [priceLoading, setPriceLoading] = useState<boolean>(true);
	const [priceError, setPriceError] = useState<ApiError | null>(null);
	const [price, setPrice] = useState<Stripe.Price | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [subscriptionData, setSubscriptionData] =
		useState<ISubscriptionData | null>(null);
	const [subscriptionError, setSubscriptionError] = useState<string | null>(
		null
	);
	async function CreateSubscription(price_id: string): Promise<void> {
		setModalVisible(true);
		const subscription = await fetch("/api/post/stripe/subscription/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				priceId: price_id,
				customerId: dbUser?.stripeId,
			}),
		}).then((res) => res.json());

		if (subscription.success) {
			setSubscriptionData({
				id: subscription.subscriptionId,
				client_secret: subscription.clientSecret,
			});
		} else {
			setSubscriptionError(subscription.message);
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
					padding: "5rem",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<h3 style={{ textAlign: "center" }}>{product.name}</h3>
				<p style={{ textAlign: "center" }}>{product.description}</p>
				<div style={{ display: "flex", justifyContent: "center" }}>
					{subscribedProduct === product.id ? (
						<p>You are subscribed</p>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<Price
								priceLoading={priceLoading}
								priceError={priceError}
								price={price}
								product={product}
							/>
							{price && (
								<Button
									type="primary"
									onClick={() => {
										CreateSubscription(price.id);
									}}
								>
									Subscribe
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
			<CheckoutModal
				isModalVisible={modalVisible}
				onCancel={() => {
					setSubscriptionData(null);
					setModalVisible(false);
				}}
				subscription={subscriptionData}
				subscriptionError={subscriptionError}
			/>
		</>
	);
};

export default Product;
