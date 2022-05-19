import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "src/db/mongo";
import User from "src/models/user";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		await dbConnect();
		try {
			const user = await User.findOne({
				fireId: req.query.id,
			});

			if (!user) {
				res.status(200).json({ success: false, data: null });
			} else {
				res.status(200).json({ success: true, data: user });
			}
		} catch (e) {
			console.log(e);
			res.status(400).json({ success: false, data: null });
		}
	} else {
		res.setHeader("Allow", "GET");
		res.status(405).end("Method Not Allowed");
	}
}
