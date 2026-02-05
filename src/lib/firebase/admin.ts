import * as admin from "firebase-admin";

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.applicationDefault(),
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "marlang-web-0",
	});
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
