import React, { useContext } from "react";
import { AuthContext } from "src/contexts/auth";

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
				<button
					style={{ height: "2rem" }}
					onClick={() => {
						signOut();
					}}
				>
					Sign Out
				</button>
			</div>
		);
	} else {
		return <></>;
	}
};

export default Navigation;
