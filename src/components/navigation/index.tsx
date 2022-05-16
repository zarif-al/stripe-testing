import React, { useContext } from "react";
import { AuthContext } from "src/contexts/auth";
import { Button } from "antd";

const Navigation = () => {
	const { signOut, firebaseUser, dbUser } = useContext(AuthContext);

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
				}}
			>
				<div style={{ marginRight: "15px" }}>
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
