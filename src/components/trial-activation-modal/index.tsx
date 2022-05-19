import React, { useState, useEffect, useContext } from "react";
import { Modal, Spin } from "antd";
import { AuthContext } from "src/contexts/auth";
import { useRouter } from "next/router";

interface ModalProps {
	isModalVisible: boolean;
}

function TrialActivationModal({ isModalVisible }: ModalProps) {
	const router = useRouter();
	const { firebaseUser, getMongoUser, dbUser } = useContext(AuthContext);
	const [startFetching, setStartFetching] = useState(false);

	useEffect(() => {
		if (isModalVisible && firebaseUser) {
			let user;
			const interval = setInterval(async () => {
				user = await fetch(`/api/get/mongo-user/${firebaseUser.uid}`).then((res) =>
					res.json()
				);
				if (user.data.subscriptionId !== null) {
					router.push("/my_subscription");
					getMongoUser(firebaseUser);
					clearInterval(interval);
				}
			}, 3000);
		}
	}, [isModalVisible, firebaseUser, router]);

	return (
		<Modal
			title="Basic Modal"
			visible={isModalVisible}
			footer={null}
			centered
			closable={false}
			destroyOnClose={true}
		>
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					gap: "10px",
				}}
			>
				<h3>Activating Trial...</h3>
				<Spin size="large" />
			</div>
		</Modal>
	);
}

export default TrialActivationModal;
