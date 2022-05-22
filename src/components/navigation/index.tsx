import React, { useContext } from "react";
import { AuthContext } from "src/contexts/auth";
import { Button } from "antd";
import Link from "next/link";
import { AuthContextTypes } from "src/utils/interface/types";

const Navigation = () => {
	const { signOut, firebaseUser, dbUser } = useContext(
		AuthContext
	) as AuthContextTypes;

	if (firebaseUser && dbUser) {
		return (
			<div
				style={{
					position: "sticky",
					top: 0,
					display: "flex",
					justifyContent: "flex-end",
					alignItems: "center",
					height: "3rem",
					backgroundColor: "#DCDCDC",
					borderBottom: "2px solid black",
					padding: "0 1rem",
				}}
			>
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
