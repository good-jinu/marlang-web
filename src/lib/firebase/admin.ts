import * as admin from "firebase-admin";

const projectId =
	process.env.FIREBASE_PROJECT_ID ||
	process.env.GCLOUD_PROJECT ||
	process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
	"marlang-web-0";

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.applicationDefault(),
		projectId,
	});
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
