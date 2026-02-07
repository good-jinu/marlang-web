const admin = require("firebase-admin");

// Initialize with a dummy project ID if no env var is set,
// though usually in this environment it should be pre-configured.
if (!admin.apps.length) {
	admin.initializeApp({
		projectId: process.env.GCLOUD_PROJECT || "marlang-web-0",
	});
}

const db = admin.firestore();

async function main() {
	try {
		console.log("--- AI Agent Configuration ---");
		const agentDoc = await db.collection("aiAgents").doc("main").get();
		if (agentDoc.exists) {
			console.log(JSON.stringify(agentDoc.data(), null, 2));
		} else {
			console.log("No AI agent configuration found at aiAgents/main");
		}

		console.log("\n--- Recent Posts ---");
		const postsSnapshot = await db
			.collection("posts")
			.orderBy("createdAt", "desc")
			.limit(5)
			.get();

		if (postsSnapshot.empty) {
			console.log("No posts found in 'posts' collection.");
		} else {
			postsSnapshot.forEach((doc) => {
				console.log(`\nID: ${doc.id}`);
				console.log(JSON.stringify(doc.data(), null, 2));
			});
		}
	} catch (error) {
		console.error("Error checking Firestore:", error);
	}
}

main();
