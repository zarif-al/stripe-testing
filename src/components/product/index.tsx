import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Price from "src/components/price";
import Stripe from "stripe";
import { ApiError } from "src/utils/interface/responses";
import { ISubscriptionData, IUser } from "src/utils/interface/types";
import { Button } from "antd";
import { useRouter } from "next/router";

interface ProductElementProps {
	product: Stripe.Product;
}

const Product = ({ product }: ProductElementProps): JSX.Element => {
	const router = useRouter();
	const [priceLoading, setPriceLoading] = useState<boolean>(true);
	const [priceError, setPriceError] = useState<ApiError | null>(null);
	const [price, setPrice] = useState<Stripe.Price | null>(null);
	const [subscriptionError, setSubscriptionError] = useState<string | null>(
		null
	);

	async function GoToCheckout(user: IUser, price_id: string): Promise<void> {
		const session = await fetch(
			"/api/post/stripe/subscription/checkout_session",
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

		if (session.success === false) {
			console.log("Session Creation Failed");
		} else {
			router.push(session.session_url);
		}
	}

	function GoToRoot(price_id: string) {
		router.push(`/?price_id=${price_id}`);
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
									GoToRoot(price.id);
								}}
							>
								Subscribe
							</Button>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Product;
