import React, { useContext } from "react";
import { AuthContext } from "src/contexts/auth";
import { Button } from "antd";
import Link from "next/link";

const Navigation = () => {
	const { signOut, firebaseUser, dbUser } = useContext(AuthContext);

	if (firebaseUser && dbUser) {
		return (
			<div
				style={{
					position: "sticky",
					top: 0,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					height: "3rem",
					backgroundColor: "#DCDCDC",
					borderBottom: "2px solid black",
					padding: "0 1rem",
				}}
			>
				<div style={{ display: "flex", gap: "6px" }}>
					<Link href="/">Home</Link>
					<Link href="/my_subscription">My Subscription</Link>
				</div>

				<div>
					<Button
						type="primary"
						onClick={() => {
							signOut();
						}}
					>
						Sign Out
					</Button>
				</div>
			</div>
		);
	} else {
		return <></>;
	}
};

export default Navigation;
