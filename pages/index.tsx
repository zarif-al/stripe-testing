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

// Loading stripe on the index page for better stability
import getStripe from "src/utils/stripe";

const stripePromise = getStripe();

interface ProductElementProps {
	product: Stripe.Product;
}

const Home: NextPage = () => {
	const router = useRouter();
	const { dbUser } = useContext(AuthContext);
	const [products, setProducts] = useState<Stripe.Product[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loadingProducts, setLoadingProducts] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);

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
