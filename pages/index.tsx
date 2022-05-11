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
import { AuthContext } from "src/contexts/auth";

interface ProductElementProps {
	product: Stripe.Product;
}

const Home: NextPage = () => {
	const router = useRouter();
	const { dbUser, UpdateUser } = useContext(AuthContext);
	const [products, setProducts] = useState<Stripe.Product[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loadingProducts, setLoadingProducts] = useState(true);
	const [subscribedProduct, setSubscribedProduct] = useState(undefined);
	async function GetSessionAndUpdate(session_id: string): Promise<void> {
		const customer_id = await fetch("/api/session", {
			method: "POST",
			body: JSON.stringify({ session_id: session_id }),
		})
			.then((res) => res.json())
			.then((res) => res.customerId);
		UpdateUser(customer_id);
	}

	useEffect(() => {
		async function GetCustomer(customer_id: string): Promise<void> {
			await fetch("/api/customer", {
				method: "POST",
				body: JSON.stringify({ customer_id: dbUser!.stripeID }),
			})
				.then((res) => res.json())
				.then((res) => {
					setSubscribedProduct(res.productId);
				});
		}

		if (dbUser && dbUser.stripeID) {
			GetCustomer(dbUser.stripeID);
		}
	}, [dbUser]);

	useEffect(() => {
		fetch("/api/products")
			.then((res) => res.json())
			.then((data: ApiError | StripeProductsResponse) => {
				if ("error" in data) {
					setError(data.error);
				} else {
					setProducts(data.data);
				}
				setLoadingProducts(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		// Check to see if this is a redirect back from Checkout
		const query = new URLSearchParams(window.location.search);
		if (query.get("success")) {
			const session_id = query.get("session_id");
			console.log("Order placed! You will receive an email confirmation.");
			if (session_id) {
				GetSessionAndUpdate(session_id);
			}
		}

		if (query.get("canceled")) {
			console.log(
				"Order canceled -- continue to shop around and checkout when you’re ready."
			);
		}
	}, []);

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

	const NoSubscription = (): JSX.Element => {
		return (
			<>
				{error && <div>{error}</div>}
				{products && productElements(products)}
				<a href="https://stripe.com/docs/testing" target="no_blank">
					Test Cards
				</a>
			</>
		);
	};

	const SubscribedProduct = ({ product }: ProductElementProps): JSX.Element => {
		return (
			<div
				style={{
					border: "1px solid #ccc",
					borderRadius: "16px",
					padding: "0.4rem",
					display: "flex",
					flexDirection: "column",
					position: "relative",
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
				<div
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						width: "100%",
						textAlign: "center",
						fontWeight: "500",
						backgroundColor: "lightGrey",
						borderRadius: "0px 0px 16px 16px",
					}}
				>
					You are subscribed to this plan
				</div>
			</div>
		);
	};

	return (
		<div className={styles.container}>
			{loadingProducts && <div>Loading...</div>}
			{!dbUser && <div>Loading DB...</div>}
			{dbUser && !dbUser.stripeID && <NoSubscription />}
			{subscribedProduct && !loadingProducts && products && (
				<SubscribedProduct
					product={
						products!.find((product) => {
							return product.id === subscribedProduct;
						}) as Stripe.Product
					}
				/>
			)}
		</div>
	);
};

export default Home;
