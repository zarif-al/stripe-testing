import React, { useContext } from "react";
import { AuthContext } from "src/contexts/auth";

const Navigation = () => {
	const { signOut, firebaseUser } = useContext(AuthContext);

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
			{firebaseUser && (
				<button
					style={{ height: "2rem" }}
					onClick={() => {
						signOut();
					}}
				>
					Sign Out
				</button>
			)}
		</div>
	);
};

export default Navigation;
