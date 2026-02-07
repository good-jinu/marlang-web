// /Users/ijin-u/workspace_p/marlang-web/src/app/api/admins/route.ts

import { getAuth } from "firebase-admin/auth";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
	try {
		// Verify the request comes from an authenticated admin
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const token = authHeader.split("Bearer ")[1];
		const decodedToken = await getAuth().verifyIdToken(token);

		// Only allow if the user is already an admin
		if (!decodedToken.admin) {
			return Response.json(
				{ error: "Forbidden: Only admins can list admins" },
				{ status: 403 },
			);
		}

		// Get all users with admin claims from the admins collection
		const adminsCollection = await adminDb.collection("admins").get();
		const admins: { uid: string; [key: string]: unknown }[] = [];

		adminsCollection.forEach((doc) => {
			admins.push({
				uid: doc.id,
				...doc.data(),
			});
		});

		return Response.json({ admins });
	} catch (error) {
		console.error("Error listing admins:", error);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
