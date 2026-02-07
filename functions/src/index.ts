import * as crypto from "node:crypto";
import { VertexAI } from "@google-cloud/vertexai";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

// 1. Define Interfaces for Type Safety
interface AgentConfig {
	name: string;
	bio: string;
	personality: {
		tone: string;
		style: string;
		interests: string[];
		systemPrompt: string;
	};
	scheduledPosting?: {
		enabled: boolean;
		schedule: string;
		lastRun?: Timestamp;
	};
	modelConfig?: {
		model?: string;
		temperature?: number;
		maxOutputTokens?: number;
	};
	thumbnailGenConfig?: {
		enabled: boolean;
		style: string;
		count: number;
		promptTemplate: string;
	};
}

interface GeneratedPostResponse {
	content: string; // The Caption
	tags: string[];
	thumbnailIdeas: string[]; // Descriptions of what images should be
}

interface BlogPost {
	content: string;
	thumbnails: string[];
	status: "published" | "draft";
	publishedAt: Timestamp;
	createdAt: Timestamp;
	updatedAt: Timestamp;
	author: string;
	authorId: string;
	generatedByAI: boolean;
	aiModelUsed: string;
	tags: string[];
	metadata: {
		imageCount: number;
		thumbnailDescriptions: string[];
	};
}

// Admin management functions
export const setAdminClaim = onRequest(async (req, res) => {
	if (req.method !== "POST") {
		res.status(405).send("Method not allowed");
		return;
	}

	// Verify the request comes from an authenticated admin
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).send("Unauthorized");
		return;
	}

	try {
		const token = authHeader.split("Bearer ")[1];
		const decodedToken = await getAuth().verifyIdToken(token);

		// Only allow if the user is already an admin
		if (!decodedToken.admin) {
			res.status(403).send("Forbidden: Only admins can set admin claims");
			return;
		}

		const { uid, email } = req.body;
		if (!uid) {
			res.status(400).send("Missing UID in request body");
			return;
		}

		// Set custom claim for admin
		await getAuth().setCustomUserClaims(uid, { admin: true });

		// Add user to admins collection for reference
		await getFirestore()
			.collection("admins")
			.doc(uid)
			.set({
				email: email || "unknown",
				createdAt: Timestamp.now(),
				addedBy: decodedToken.uid,
			});

		res
			.status(200)
			.send({ success: true, message: `Admin claim set for user ${uid}` });
	} catch (error) {
		console.error("Error setting admin claim:", error);
		res.status(500).send({ error: "Internal server error" });
	}
});

export const removeAdminClaim = onRequest(async (req, res) => {
	if (req.method !== "DELETE") {
		res.status(405).send("Method not allowed");
		return;
	}

	// Verify the request comes from an authenticated admin
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).send("Unauthorized");
		return;
	}

	try {
		const token = authHeader.split("Bearer ")[1];
		const decodedToken = await getAuth().verifyIdToken(token);

		// Only allow if the user is already an admin
		if (!decodedToken.admin) {
			res.status(403).send("Forbidden: Only admins can remove admin claims");
			return;
		}

		const { uid } = req.body;
		if (!uid) {
			res.status(400).send("Missing UID in request body");
			return;
		}

		// Remove custom claim for admin
		await getAuth().setCustomUserClaims(uid, {});

		// Remove user from admins collection
		await getFirestore().collection("admins").doc(uid).delete();

		res
			.status(200)
			.send({ success: true, message: `Admin claim removed for user ${uid}` });
	} catch (error) {
		console.error("Error removing admin claim:", error);
		res.status(500).send({ error: "Internal server error" });
	}
});

export const listAdmins = onRequest(async (req, res) => {
	if (req.method !== "GET") {
		res.status(405).send("Method not allowed");
		return;
	}

	// Verify the request comes from an authenticated admin
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).send("Unauthorized");
		return;
	}

	try {
		const token = authHeader.split("Bearer ")[1];
		const decodedToken = await getAuth().verifyIdToken(token);

		// Only allow if the user is already an admin
		if (!decodedToken.admin) {
			res.status(403).send("Forbidden: Only admins can list admins");
			return;
		}

		// Get all users with admin claims
		const adminsCollection = await getFirestore().collection("admins").get();
		const admins: { uid: string; [key: string]: unknown }[] = [];

		adminsCollection.forEach((doc) => {
			admins.push({
				uid: doc.id,
				...doc.data(),
			});
		});

		res.status(200).send({ admins });
	} catch (error) {
		console.error("Error listing admins:", error);
		res.status(500).send({ error: "Internal server error" });
	}
});

export const generateDailyBlogPost = onSchedule(
	{
		schedule: "0 9 * * *",
		timeZone: "UTC",
		memory: "1GiB", // Increased for image processing
		region: "asia-east1",
	},
	async (_event) => {
		const db = getFirestore();
		const storage = getStorage();
		const bucket = storage.bucket();

		// 1. Get AI agent configuration
		const agentDoc = await db.collection("aiAgents").doc("main").get();

		if (!agentDoc.exists) {
			console.log("No agent configuration found");
			return;
		}

		const agent = agentDoc.data() as AgentConfig;

		if (!agent.scheduledPosting?.enabled) {
			console.log("Scheduled posting is disabled");
			return;
		}

		// 2. Initialize Vertex AI
		const project = process.env.GCLOUD_PROJECT;
		if (!project) throw new Error("GCLOUD_PROJECT env variable not set");

		const vertexAI = new VertexAI({
			project: project,
			location: "us-central1",
		});

		// 3. Generate Content (Caption & Image Descriptions)
		const contentModel = vertexAI.getGenerativeModel({
			model: agent.modelConfig?.model || "gemini-2.0-flash",
			generationConfig: {
				temperature: agent.modelConfig?.temperature || 0.7,
				maxOutputTokens: agent.modelConfig?.maxOutputTokens || 2048,
			},
		});

		const thumbCount = agent.thumbnailGenConfig?.count || 1;
		const thumbStyle =
			agent.thumbnailGenConfig?.style || "Cinematic, realistic";

		const contentPrompt = `You are ${agent.name}, ${agent.bio}.
    Tone: ${agent.personality.tone}, Style: ${agent.personality.style}.
    Interests: ${agent.personality.interests.join(", ")}.
    Instructions: ${agent.personality.systemPrompt}

    Task: Create a new Instagram-style post for today.

    Requirements:
    1. Write a compelling CAPTION (max 500 characters, includes emojis).
    2. Provide ${thumbCount} specific image descriptions for the carousel.
       Style: ${thumbStyle}.
       Prompt Template: ${agent.thumbnailGenConfig?.promptTemplate || "An image of {agent_name} {activity}"}
    3. Suggest 5 relevant hashtags.

    Format your response EXACTLY as a JSON object with these keys:
    "content" (the caption string),
    "tags" (array of strings),
    "thumbnailIdeas" (array of strings describing each image).

    No other text or markdown.`;

		try {
			const result = await contentModel.generateContent(contentPrompt);
			const response = await result.response;
			const text = response.candidates?.[0].content.parts[0].text;
			if (!text) throw new Error("No text generated");

			const jsonStr = text
				.replace(/```json/g, "")
				.replace(/```/g, "")
				.trim();
			const postData = JSON.parse(jsonStr) as GeneratedPostResponse;

			// 4. Generate Images using Imagen 3 (Nano Banana)
			const imageModel = vertexAI.getGenerativeModel({
				model: "imagen-3.0-generate-001",
			});

			const imageUrls: string[] = [];

			for (const desc of postData.thumbnailIdeas) {
				try {
					console.log(`Generating image for: ${desc}`);
					const imgResult = await imageModel.generateContent(desc);
					const imgResponse = await imgResult.response;

					// Imagen binary data is usually in inlineData
					const part = imgResponse.candidates?.[0].content.parts[0];
					if (part?.inlineData) {
						const buffer = Buffer.from(part.inlineData.data, "base64");
						const filename = `post-images/${crypto.randomUUID()}.png`;
						const file = bucket.file(filename);

						await file.save(buffer, {
							metadata: { contentType: "image/png" },
						});

						// Use a public URL or signed URL (Public for this blog)
						await file.makePublic();
						const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
						imageUrls.push(publicUrl);
					}
				} catch (imgError) {
					console.error("Image generation individual step failed:", imgError);
				}
			}

			// 5. Finalize Post
			if (imageUrls.length === 0) {
				console.log("Failed to generate any images, skipping post.");
				return;
			}

			const newPost: BlogPost = {
				content: postData.content,
				thumbnails: imageUrls,
				status: "published",
				publishedAt: Timestamp.now(),
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
				author: agent.name,
				authorId: "main",
				generatedByAI: true,
				aiModelUsed: agent.modelConfig?.model || "gemini-2.0-flash",
				tags: postData.tags || [],
				metadata: {
					imageCount: imageUrls.length,
					thumbnailDescriptions: postData.thumbnailIdeas,
				},
			};

			await db.collection("posts").add(newPost);

			// Update agent's last run
			await db.collection("aiAgents").doc("main").update({
				"scheduledPosting.lastRun": Timestamp.now(),
			});

			console.log(
				`Successfully generated Instagram post with ${imageUrls.length} real AI images.`,
			);
		} catch (error) {
			console.error("AI Generation process failed:", error);
		}
	},
);
