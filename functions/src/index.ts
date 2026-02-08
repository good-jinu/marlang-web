import * as crypto from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getDownloadURL, getStorage } from "firebase-admin/storage";
import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

initializeApp();

/* ------------------------------------------------------------------ */
/* Schemas */
/* ------------------------------------------------------------------ */

const postSchema = z.object({
	title: z.string().describe("The title of the blog post."),
	content: z.string().describe("The main content of the blog post."),
	tags: z.array(z.string()).describe("List of tags for the post."),
	thumbnailIdeas: z
		.array(z.string())
		.describe("List of descriptive ideas for thumbnails."),
});

const jsonExample = JSON.stringify(
	{
		title: "The Future of AI Agents",
		content: "Detailed discussion about autonomous systems...",
		tags: ["AI", "Tech", "Automation"],
		thumbnailIdeas: ["A futuristic robot writing on a digital screen"],
	},
	null,
	2,
);

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

interface AgentConfig {
	name: string;
	personality: {
		systemPrompt: string;
	};
	scheduledPosting?: {
		enabled: boolean;
		schedule: number;
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

// GeneratedPostResponse type is inferred from postSchema below

interface BlogPost {
	title: string;
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

/* ------------------------------------------------------------------ */
/* Core Task Logic */
/* ------------------------------------------------------------------ */

/**
 * Core logic to execute the AI agent's task of generating a blog post.
 */
async function executeAgentTask() {
	const db = getFirestore();
	const storage = getStorage().bucket();

	logger.info("Fetching agent configuration...");
	const agentSnap = await db.collection("aiAgents").doc("main").get();

	if (!agentSnap.exists) {
		logger.warn("Agent document does not exist. Exiting.");
		return { success: false, reason: "Agent document does not exist" };
	}

	const agent = agentSnap.data() as AgentConfig;
	logger.info("Agent loaded:", { name: agent.name });

	const ai = new GoogleGenAI({
		apiKey: process.env.GOOGLE_AI_API_KEY as string,
	});
	logger.info("GoogleGenAI initialized");

	/* ---------------- Text Generation ---------------- */

	const modelName = agent.modelConfig?.model ?? "gemini-1.5-flash";
	logger.info("Initializing text model:", { modelName });

	logger.info("Generating text content...");
	const structuredPrompt = `
${agent.personality.systemPrompt}

### OUTPUT INSTRUCTIONS
You must return only valid JSON.
Do not include markdown formatting or backticks.

### EXAMPLE OUTPUT FORMAT
${jsonExample}

### START GENERATION
`;

	const textResult = await ai.models.generateContent({
		model: modelName,
		contents: [{ role: "user", parts: [{ text: structuredPrompt }] }],
		config: {
			responseMimeType: "application/json",
			responseJsonSchema: zodToJsonSchema(postSchema as any),
		},
	});

	const rawText = textResult.text;

	if (!rawText) {
		logger.error("No text generated from model");
		throw new Error("No text generated");
	}

	logger.debug("Raw text preview:", rawText);

	const postData = postSchema.parse(JSON.parse(rawText));
	logger.info("Post data extracted and validated:", {
		title: postData.title,
		tagCount: postData.tags.length,
		thumbnailIdeaCount: postData.thumbnailIdeas.length,
	});

	/* ---------------- Image Generation ---------------- */

	const imageUrls: string[] = [];

	if (agent.thumbnailGenConfig?.enabled) {
		logger.info(
			`Image generation enabled using GoogleGenAI. Project: ${process.env.GCLOUD_PROJECT}`,
		);

		const imagePrompt = postData.thumbnailIdeas[0] || postData.title;
		const imageCount = agent.thumbnailGenConfig.count || 1;

		logger.info(`Generating ${imageCount} images for prompt: ${imagePrompt}`);

		try {
			const imageResponse = await ai.models.generateImages({
				model: "imagen-4.0-fast-generate-001",
				prompt: imagePrompt,
				config: {
					numberOfImages: imageCount,
				},
			});

			logger.info(
				`Received ${imageResponse.generatedImages?.length || 0} images from AI`,
			);

			if (imageResponse.generatedImages) {
				for (let i = 0; i < imageResponse.generatedImages.length; i++) {
					const generatedImage = imageResponse.generatedImages[i];
					if (!generatedImage.image) {
						logger.warn(`No image data for image ${i + 1}`);
						continue;
					}
					const imgBytes = generatedImage.image.imageBytes;

					if (!imgBytes) {
						logger.warn(`No image bytes for image ${i + 1}`);
						continue;
					}

					const buffer = Buffer.from(imgBytes, "base64");
					const filename = `post-images/${crypto.randomUUID()}.png`;
					const file = storage.file(filename);

					logger.info(`Uploading image ${i + 1} to storage...`);
					await file.save(buffer, {
						contentType: "image/png",
					});

					const url = await getDownloadURL(file);
					imageUrls.push(url);
					logger.info(`Image ${i + 1} saved and Download URL created`);
				}
			}
		} catch (error: unknown) {
			logger.error("Error generating images with GoogleGenAI:", error);
		}

		logger.info("Image generation complete:", {
			totalImages: imageUrls.length,
		});
	}

	if (!imageUrls.length) {
		logger.warn("No images were generated. Exiting without saving post.");
		return { success: false, reason: "No images generated" };
	}

	/* ---------------- Persist ---------------- */

	logger.info("Creating post document...");

	const post: BlogPost = {
		title: postData.title,
		content: postData.content,
		thumbnails: imageUrls,
		status: "published",
		publishedAt: Timestamp.now(),
		createdAt: Timestamp.now(),
		updatedAt: Timestamp.now(),
		author: agent.name,
		authorId: "main",
		generatedByAI: true,
		aiModelUsed: modelName,
		tags: postData.tags,
		metadata: {
			imageCount: imageUrls.length,
			thumbnailDescriptions: postData.thumbnailIdeas.slice(0, imageUrls.length),
		},
	};

	logger.info("Saving post to Firestore...");
	const postRef = await db.collection("posts").add(post);
	logger.info("Post saved successfully with ID:", postRef.id);

	logger.info("Updating agent lastRun timestamp...");
	await db.collection("aiAgents").doc("main").update({
		"scheduledPosting.lastRun": Timestamp.now(),
	});

	return { success: true, postId: postRef.id };
}

/* ------------------------------------------------------------------ */
/* Scheduler */
/* ------------------------------------------------------------------ */

export const generateDailyBlogPost = onSchedule(
	{
		schedule: "0 * * * *",
		timeZone: "UTC",
		region: "asia-east1",
		memory: "1GiB",
		timeoutSeconds: 300,
		secrets: ["GOOGLE_AI_API_KEY"],
	},
	async () => {
		logger.info("=== Daily blog post generation started ===");

		const db = getFirestore();

		logger.info("Fetching agent configuration for time check...");
		const agentSnap = await db.collection("aiAgents").doc("main").get();

		if (!agentSnap.exists) {
			logger.warn("Agent document does not exist. Exiting.");
			return;
		}

		const agent = agentSnap.data() as AgentConfig;

		if (!agent.scheduledPosting?.enabled) {
			logger.info("Scheduled posting is disabled. Exiting.");
			return;
		}

		const now = new Date();
		const currentHour = now.getUTCHours();
		logger.info(
			`Time check: ${currentHour} === ${agent.scheduledPosting.schedule}`,
		);

		if (currentHour !== agent.scheduledPosting.schedule) {
			logger.info("Not the scheduled hour. Exiting.");
			return;
		}

		const lastRun = agent.scheduledPosting.lastRun?.toDate();
		if (lastRun) {
			const hoursSinceLastRun =
				(now.getTime() - lastRun.getTime()) / (60 * 60 * 1000);
			logger.info("Last run check:", {
				lastRun: lastRun.toISOString(),
				hoursSinceLastRun,
			});

			if (now.getTime() - lastRun.getTime() < 60 * 60 * 1000) {
				logger.info("Already ran within the last 1 hours. Exiting.");
				return;
			}
		} else {
			logger.info("No previous run detected.");
		}

		const result = await executeAgentTask();

		if (result.success) {
			logger.info("=== Daily blog post generation completed successfully ===", {
				postId: result.postId,
			});
		} else {
			logger.warn("=== Daily blog post generation failed or skipped ===", {
				reason: result.reason,
			});
		}
	},
);

/* ------------------------------------------------------------------ */
/* Callable Functions */
/* ------------------------------------------------------------------ */

export const runAgentImmediately = onCall(
	{
		region: "asia-east1",
		memory: "1GiB",
		timeoutSeconds: 300,
		secrets: ["GOOGLE_AI_API_KEY"],
	},
	async (_request) => {
		logger.info("=== Manual agent run started ===");

		if (!_request.auth) {
			throw new HttpsError(
				"unauthenticated",
				"The function must be called while authenticated.",
			);
		}

		const result = await executeAgentTask();

		if (result.success) {
			logger.info("=== Manual agent run completed successfully ===", {
				postId: result.postId,
			});
		} else {
			logger.warn("=== Manual agent run failed or skipped ===", {
				reason: result.reason,
			});
		}

		return result;
	},
);
