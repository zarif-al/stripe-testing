import React, { useState, useEffect } from "react";
import Image from "next/image";
import Price from "src/components/price";
import Stripe from "stripe";
import { ApiError } from "src/utils/interface/responses";
import { Button } from "antd";

interface ProductElementProps {
	product: Stripe.Product;
	subscribedProduct: string | undefined;
}

const Product = ({
	product,
	subscribedProduct,
}: ProductElementProps): JSX.Element => {
	const [priceLoading, setPriceLoading] = useState<boolean>(true);
	const [priceError, setPriceError] = useState<ApiError | null>(null);
	const [price, setPrice] = useState<Stripe.Price | null>(null);

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
		<div
			style={{
				border: "1px solid #ccc",
				borderRadius: "16px",
				padding: "0.4rem",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div style={{ borderRadius: "12px", overflow: "hidden" }}>
				<Image
					src={product.images[0]}
					alt={product.name}
					height={400}
					width={350}
				/>
			</div>

			<h3 style={{ textAlign: "center" }}>{product.name}</h3>
			<p style={{ textAlign: "center" }}>{product.description}</p>
			<div style={{ display: "flex", justifyContent: "center" }}>
				{subscribedProduct === product.id ? (
					<p>You are subscribed</p>
				) : (
					<>
						<Price
							priceLoading={priceLoading}
							priceError={priceError}
							price={price}
							product={product}
						/>
						<Button type="primary">Subscribe</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default Product;
