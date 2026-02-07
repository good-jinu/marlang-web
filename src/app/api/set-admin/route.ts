// /Users/ijin-u/workspace_p/marlang-web/src/app/api/set-admin/route.ts

import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
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
				{ error: "Forbidden: Only admins can set admin claims" },
				{ status: 403 },
			);
		}

		const { uid, email } = await request.json();
		if (!uid) {
			return Response.json(
				{ error: "Missing UID in request body" },
				{ status: 400 },
			);
		}

		// Set custom claim for admin
		await getAuth().setCustomUserClaims(uid, { admin: true });

		// Add user to admins collection for reference
		await adminDb
			.collection("admins")
			.doc(uid)
			.set({
				email: email || "unknown",
				createdAt: Timestamp.now(),
				addedBy: decodedToken.uid,
			});

		return Response.json({
			success: true,
			message: `Admin claim set for user ${uid}`,
		});
	} catch (error) {
		console.error("Error setting admin claim:", error);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
