import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
			bufferMaxEntries: 0,
		};

		if (!MONGO_URI) {
			throw new Error(
				"Please define the MONGO_URI environment variable inside .env.local"
			);
		}

		try {
			cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => {
				return mongoose;
			});
		} catch (e) {
			console.log(e);
		}
	}

	try {
		cached.conn = await cached.promise;
		return cached.conn;
	} catch (e) {
		console.log(e);
	}
}

export default dbConnect;
