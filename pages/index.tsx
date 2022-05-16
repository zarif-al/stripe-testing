import type { NextPage } from "next";
import React, { useContext, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Stripe from "stripe";
import {
	ApiError,
	StripeProductsResponse,
} from "src/utils/interface/responses";
import { useRouter } from "next/router";
import { AuthContext } from "src/contexts/auth";
import CustomModal from "src/components/modal";
import Product from "src/components/product";

interface ProductElementProps {
	product: Stripe.Product;
}

const Home: NextPage = () => {
	const router = useRouter();
	const { dbUser } = useContext(AuthContext);
	const [products, setProducts] = useState<Stripe.Product[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loadingProducts, setLoadingProducts] = useState(true);
	const [subscribedProduct, setSubscribedProduct] = useState(undefined);
	const [confirmingPayment, setConfirmingPayment] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);

	/* 	async function GetSessionAndUpdate(session_id: string): Promise<void> {
		const customer_id = await fetch("/api/session", {
			method: "POST",
			body: JSON.stringify({ session_id: session_id }),
		})
			.then((res) => res.json())
			.then((res) => res.customerId);

		setConfirmingPayment(false);
		router.push("/");
	} */

	/* 	useEffect(() => {
		async function GetCustomer(customer_id: string): Promise<void> {
			await fetch("/api/customer", {
				method: "POST",
				body: JSON.stringify({ customer_id: dbUser!.stripeId }),
			})
				.then((res) => res.json())
				.then((res) => {
					setSubscribedProduct(res.productId);
				});
		}

		if (dbUser && dbUser.stripeId) {
			GetCustomer(dbUser.stripeId);
		}
	}, [dbUser]); */

	useEffect(() => {
		fetch("/api/get/stripe/products")
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
	}, [dbUser]);

	/* 	useEffect(() => {
		// Check to see if this is a redirect back from Checkout
		const query = new URLSearchParams(window.location.search);
		if (query.get("success") && dbUser) {
			const session_id = query.get("session_id");
			console.log("Order placed! You will receive an email confirmation.");
			if (session_id) {
				setConfirmingPayment(true);
				GetSessionAndUpdate(session_id);
			}
		}

		if (query.get("canceled")) {
			console.log(
				"Order canceled -- continue to shop around and checkout when you’re ready."
			);
		}
	}, [dbUser]);  */

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
						return (
							<Product
								product={product}
								key={product.id}
								subscribedProduct={subscribedProduct}
							/>
						);
					})}
				</div>
			</div>
		);
	};

	const SubscriptionList = (): JSX.Element => {
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

	/* 	if (confirmingPayment) {
		return <div className={styles.container}>Confirming payment...</div>;
	} */

	if (loadingProducts || !dbUser) {
		return <div className={styles.container}>Loading...</div>;
	} else {
		return (
			<div className={styles.container}>
				<SubscriptionList />
			</div>
		);
	}
};

export default Home;
