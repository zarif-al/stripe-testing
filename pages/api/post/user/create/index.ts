import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "src/db/mongo";
import User from "src/models/user";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		await dbConnect();
		try {
			const user = await User.create({ ...req.body });
			res.status(201).json({ success: true, data: user });
		} catch (e: any) {
			console.log(e);
			res.status(201).json({ success: false, error: e.message });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
