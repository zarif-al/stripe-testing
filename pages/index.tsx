import type { NextPage } from "next";
import React, { useContext, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Stripe from "stripe";
import {
	ApiError,
	StripeProductsResponse,
} from "src/utils/interface/apiResponses";
import { useRouter } from "next/router";
import getStripe from "src/utils/stripe";

interface ProductElementProps {
	product: Stripe.Product;
}

const stripe = getStripe();

const Home: NextPage = () => {
	const router = useRouter();
	const [products, setProducts] = useState<Stripe.Product[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/products")
			.then((res) => res.json())
			.then((data: ApiError | StripeProductsResponse) => {
				if ("error" in data) {
					setError(data.error);
				} else {
					setProducts(data.data);
				}
				setLoading(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		// Check to see if this is a redirect back from Checkout
		const query = new URLSearchParams(window.location.search);
		if (query.get("success")) {
			console.log("Order placed! You will receive an email confirmation.");
		}

		if (query.get("canceled")) {
			console.log(
				"Order canceled -- continue to shop around and checkout when you’re ready."
			);
		}
	}, []);

	/* 	async function makePayment(priceId: string) {
		const link = await fetch("api/checkout_sessions", {
			method: "POST",
			body: JSON.stringify({ priceId: priceId }),
		});
	}
 */
	const Product = ({ product }: ProductElementProps): JSX.Element => {
		const [priceLoading, setPriceLoading] = useState<boolean>(true);
		const [priceError, setPriceError] = useState<ApiError | null>(null);
		const [price, setPrice] = useState<Stripe.Price | null>(null);

		useEffect(() => {
			fetch("/api/price/" + product.default_price)
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
					{priceLoading && <div>...Loading</div>}
					{priceError && <div>{priceError.error}</div>}
					{price && price.recurring && price.unit_amount && product.default_price && (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								fontWeight: "500",
								gap: "5px",
							}}
						>
							{price.unit_amount / 100 + "$"}/{price.recurring.interval}
							<form action="/api/checkout_sessions" method="POST">
								<input
									type="hidden"
									name="priceId"
									value={product.default_price as string}
								/>
								<button type="submit" role="link">
									Subscribe
								</button>
							</form>
						</div>
					)}
				</div>
			</div>
		);
	};

	const productElements = (products: Stripe.Product[]) => {
		const sortedProducts = products.sort((a, b) => {
			return a.created - b.created;
		});

		return (
			<div style={{ display: "flex", flexDirection: "column" }}>
				<h2 style={{ textAlign: "center" }}>Payment Plans</h2>
				<div
					style={{
						display: "flex",
						gap: "10px",
					}}
				>
					{sortedProducts.map((product) => {
						return <Product product={product} key={product.id} />;
					})}
				</div>
			</div>
		);
	};

	return (
		<div className={styles.container}>
			{loading && <div>Loading...</div>}
			{error && <div>{error}</div>}
			{products && productElements(products)}
			<a href="https://stripe.com/docs/testing" target="no_blank">
				Test Cards
			</a>
		</div>
	);
};

export default Home;
