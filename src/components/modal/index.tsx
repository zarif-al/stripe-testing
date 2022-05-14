import React, { useState } from "react";
import { Modal, Button } from "antd";

interface ModalProps {
	isModalVisible: boolean;
	children: React.ReactNode;
	onCancel: () => void;
}

function CustomModal({ isModalVisible, onCancel, children }: ModalProps) {
	return (
		<Modal
			title="Basic Modal"
			visible={isModalVisible}
			footer={null}
			onCancel={onCancel}
			centered
			destroyOnClose={true}
		>
			{children}
		</Modal>
	);
}

export default CustomModal;
