import React from "react";
import { ApiError } from "src/utils/interface/responses";
import Stripe from "stripe";
import { Button } from "antd";

interface PriceProps {
	priceLoading: boolean;
	priceError: ApiError | null;
	price: Stripe.Price | null;
	product: Stripe.Product;
}

const Price = ({
	priceLoading,
	priceError,
	price,
	product,
}: PriceProps): JSX.Element => {
	return (
		<>
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
				</div>
			)}
		</>
	);
};

export default Price;
