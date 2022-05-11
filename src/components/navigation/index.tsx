import React, { useContext } from "react";
import { AuthContext } from "src/contexts/auth";

const Navigation = () => {
	const { signOut } = useContext(AuthContext);

	return (
		<div
			style={{
				position: "sticky",
				top: 0,
				display: "flex",
				justifyContent: "flex-end",
				padding: "0.8rem",
				backgroundColor: "#DCDCDC",
				borderBottom: "2px solid black",
			}}
		>
			<button
				style={{
					padding: "0.2rem",
				}}
				onClick={() => {
					signOut();
				}}
			>
				Sign Out
			</button>
		</div>
	);
};

export default Navigation;
