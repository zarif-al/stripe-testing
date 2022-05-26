import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "src/contexts/auth";
import { useRouter } from "next/router";
import { IUser, AuthContextTypes } from "src/utils/interface/types";

function Redirect() {
	const router = useRouter();
	const { dbUser, setSelectedProduct, selectedProduct, getMongoUser } =
		useContext(AuthContext) as AuthContextTypes;
	const [message, setMessage] = useState("");
	const [startFetching, setStartFetching] = useState(false);

	async function StartTrial(user: IUser, price_id: string): Promise<void> {
		// TODO : Figure out a better solution. Ex For new accounts same card.
		if (user.activatedTrial) {
			setMessage("Sorry, you have already used a trial");
		} else {
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
				setMessage("Confirming Trial...");
				const interval = setInterval(async () => {
					const mongoUser = await fetch(`/api/get/mongo-user/${user.fireId}`).then(
						(res) => res.json()
					);
					if (mongoUser.data.subscriptionId !== null) {
						getMongoUser(user.fireId);
						setTimeout(() => {
							router.push("/");
						}, 1000);
						clearInterval(interval);
					}
				}, 3000);
			} else {
				console.log(subscription.message);
			}
		}
	}

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

	function debounce(
	    func: (user: IUser, price_id: string) => void,
	    timeout = 500,
	  ): (user: IUser, price_id: string) => void {
	    let timer: ReturnType<typeof setTimeout>;
	    return (...args: [user: IUser, price_id: string]) => {
	      clearTimeout(timer);
	      timer = setTimeout(() => {
		func.apply(null, args as [user: IUser, price_id: string]);
	      }, timeout);
	    };
	  } 

	const GoToCheckoutDebounced = useCallback(
		debounce((user: IUser, price_id: string) => {
			GoToCheckout(user, price_id);
		}),
		[]
	);

	const StartTrialDebounced = useCallback(
		debounce((user: IUser, price_id: string) => {
			StartTrial(user, price_id);
		}),
		[]
	);

	useEffect(() => {
		console.log("UseEffect Trigger");
		if (selectedProduct && dbUser) {
			if (selectedProduct.trialMode === true) {
				setMessage("Starting Trial...");
				StartTrialDebounced(dbUser, selectedProduct.priceId);
			} else {
				setMessage("Redirecting to Stripe...");
				GoToCheckoutDebounced(dbUser, selectedProduct.priceId);
			}
			setSelectedProduct(null);
		}
	}, [
		dbUser,
		router.pathname,
		selectedProduct,
		setSelectedProduct,
		GoToCheckoutDebounced,
		StartTrialDebounced,
	]);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "90vh",
			}}
		>
			{message}
		</div>
	);
}

export default Redirect;
