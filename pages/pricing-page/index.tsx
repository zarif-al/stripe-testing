import type { NextPage } from "next";
import React, { useContext, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "styles/Home.module.css";
import Stripe from "stripe";
import {
	ApiError,
	StripeProductsResponse,
} from "src/utils/interface/responses";
import { useRouter } from "next/router";
import { AuthContext } from "src/contexts/auth";
import Product from "src/components/product";
import { AuthContextTypes } from "src/utils/interface/types";

function PricingPage() {
	const router = useRouter();
	const [products, setProducts] = useState<Stripe.Product[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loadingProducts, setLoadingProducts] = useState(true);

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
	}, []);

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

	const SubscriptionList = (): JSX.Element => {
		return (
			<>
				{error && <div>{error}</div>}
				{products && productElements(products)}
				<a
					href="https://stripe.com/docs/testing"
					target="no_blank"
					style={{ fontSize: "24px", marginTop: "10px" }}
				>
					Test Cards
				</a>
			</>
		);
	};

	/* 	if (confirmingPayment) {
		return <div className={styles.container}>Confirming payment...</div>;
	} */

	if (loadingProducts) {
		return <div className={styles.container}>Loading...</div>;
	} else {
		return (
			<div className={styles.container}>
				<SubscriptionList />
			</div>
		);
	}
}

export default PricingPage;
