import mongoose from "mongoose";
import { IUser } from "src/utils/interface/types";

const UserSchema = new mongoose.Schema<IUser>({
	name: { type: String, requred: true },
	email: { type: String, requred: true },
	stripeId: String,
	fireId: { type: String, requred: true },
	subscriptionId: String,
	subscriptionStatus: String,
	productId: String,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
