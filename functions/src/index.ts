import * as crypto from "node:crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { logger } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

/* ------------------------------------------------------------------ */
/* Utils */
/* ------------------------------------------------------------------ */

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]/g, "")
		.replace(/--+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function extractJson(text: string): unknown {
	const match = text.match(/\{[\s\S]*\}/);
	if (!match) throw new Error("No JSON object found in model output");
	return JSON.parse(match[0]);
}

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

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

interface GeneratedPostResponse {
	title: string;
	content: string;
	tags: string[];
	thumbnailIdeas: string[];
}

interface BlogPost {
	title: string;
	slug: string;
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
/* Scheduler */
/* ------------------------------------------------------------------ */

export const generateDailyBlogPost = onSchedule(
	{
		schedule: "47 * * * *",
		timeZone: "UTC",
		region: "asia-east1",
		memory: "256MiB",
	},
	async () => {
		logger.info("=== Daily blog post generation started ===");

		const db = getFirestore();
		const storage = getStorage().bucket();

		logger.info("Fetching agent configuration...");
		const agentSnap = await db.collection("aiAgents").doc("main").get();

		if (!agentSnap.exists) {
			logger.warn("Agent document does not exist. Exiting.");
			return;
		}

		const agent = agentSnap.data() as AgentConfig;
		logger.info("Agent loaded:", { name: agent.name });

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

			if (now.getTime() - lastRun.getTime() < 23 * 60 * 60 * 1000) {
				logger.info("Already ran within the last 23 hours. Exiting.");
				return;
			}
		} else {
			logger.info("No previous run detected.");
		}

		if (!process.env.GOOGLE_AI_API_KEY) {
			logger.error("GOOGLE_AI_API_KEY environment variable not set. Exiting.");
			throw new Error("GOOGLE_AI_API_KEY not set");
		}
		const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
		logger.info("GoogleGenerativeAI initialized");

		/* ---------------- Text Generation ---------------- */

		const modelName = agent.modelConfig?.model ?? "gemini-1.5-flash";
		logger.info("Initializing text model:", { modelName });

		const textModel = genAI.getGenerativeModel({
			model: modelName,
		});

		const prompt = `
You are ${agent.name}. ${agent.bio}

Tone: ${agent.personality.tone}
Style: ${agent.personality.style}
Interests: ${agent.personality.interests.join(", ")}

TASK:
Create an Instagram-style post.

OUTPUT JSON ONLY with:
{
  "title": string,
  "content": string,
  "tags": string[],
  "thumbnailIdeas": string[]
}
`;

		logger.info("Generating text content...");
		const textResult = await textModel.generateContent(prompt);
		const response = await textResult.response;
		const rawText = response.text();

		if (!rawText) {
			logger.error("No text generated from model");
			throw new Error("No text generated");
		}

		logger.info("Raw text received:", { length: rawText.length });
		logger.debug("Raw text preview:", rawText.substring(0, 200));

		const postData = extractJson(rawText) as GeneratedPostResponse;
		logger.info("Post data extracted:", {
			title: postData.title,
			tagCount: postData.tags.length,
			thumbnailIdeaCount: postData.thumbnailIdeas.length,
		});

		/* ---------------- Image Generation ---------------- */

		const imageUrls: string[] = [];

		if (agent.thumbnailGenConfig?.enabled) {
			logger.info("Image generation enabled. Starting...");

			const imageModel = genAI.getGenerativeModel({
				model: "imagen-3.0-generate-001",
			});

			const maxImages = Math.min(postData.thumbnailIdeas.length, 3);
			const delayBetweenRequests = 15000; // 15 seconds

			for (let i = 0; i < maxImages; i++) {
				const idea = postData.thumbnailIdeas[i];
				logger.info(`Generating image ${i + 1}/${maxImages}: ${idea}`);

				try {
					if (i > 0) {
						logger.info(
							`Waiting ${delayBetweenRequests}ms before next image...`,
						);
						await new Promise((resolve) =>
							setTimeout(resolve, delayBetweenRequests),
						);
					}

					const imageResult = await imageModel.generateContent(idea);
					const imageResponse = await imageResult.response;
					const base64 =
						imageResponse.candidates?.[0].content.parts[0].inlineData?.data;

					if (!base64) {
						logger.warn(`No base64 data for image ${i + 1}`);
						continue;
					}

					logger.info(`Image ${i + 1} generated. Uploading to storage...`);
					const buffer = Buffer.from(base64, "base64");
					const filename = `posts/${crypto.randomUUID()}.png`;
					const file = storage.file(filename);

					await file.save(buffer, {
						contentType: "image/png",
					});
					logger.info(`Image ${i + 1} uploaded:`, { filename });

					const [url] = await file.getSignedUrl({
						action: "read",
						expires: "03-01-2500",
					});

					imageUrls.push(url);
					logger.info(`Signed URL created for image ${i + 1}`);
				} catch (error: any) {
					logger.error(`Error generating image ${i + 1}:`, error);

					if (error.message?.includes("429")) {
						logger.warn("Rate limit reached, stopping image generation");
						break;
					}
				}
			}

			logger.info("Image generation complete:", {
				totalImages: imageUrls.length,
			});
		}

		if (!imageUrls.length) {
			logger.warn("No images were generated. Exiting without saving post.");
			return;
		}

		/* ---------------- Persist ---------------- */

		const slug = `${slugify(postData.title)}-${crypto
			.randomBytes(3)
			.toString("hex")}`;

		logger.info("Creating post document:", { slug });

		const post: BlogPost = {
			title: postData.title,
			slug,
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
				thumbnailDescriptions: postData.thumbnailIdeas.slice(
					0,
					imageUrls.length,
				),
			},
		};

		logger.info("Saving post to Firestore...");
		await db.collection("posts").doc(slug).set(post);
		logger.info("Post saved successfully");

		logger.info("Updating agent lastRun timestamp...");
		await db.collection("aiAgents").doc("main").update({
			"scheduledPosting.lastRun": Timestamp.now(),
		});

		logger.info("=== Daily blog post generation completed successfully ===", {
			postSlug: slug,
			imageCount: imageUrls.length,
		});
	},
);
