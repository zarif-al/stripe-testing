import React, { useContext, useEffect } from "react";
import { AuthContext } from "src/contexts/auth";
import { useRouter } from "next/router";
import { IUser } from "src/utils/interface/types";

function Redirect() {
	const router = useRouter();
	const { dbUser, setSelectedProduct, selectedProduct } =
		useContext(AuthContext);

	useEffect(() => {
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

		if (selectedProduct && dbUser) {
			GoToCheckout(dbUser, selectedProduct);
			setSelectedProduct(null);
		}
	}, [dbUser, router]);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "90vh",
			}}
		>
			Redirecting to stripe...
		</div>
	);
}

export default Redirect;
