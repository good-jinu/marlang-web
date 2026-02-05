const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { VertexAI } = require("@google-cloud/vertexai");

initializeApp();

exports.generateDailyBlogPost = onSchedule(
	{
		schedule: "0 9 * * *", // Daily at 9 AM UTC
		timeZone: "UTC",
		memory: "512MiB",
		region: "asia-east1",
	},
	async (_event) => {
		const db = getFirestore();

		// 1. Get AI agent configuration
		const agentDoc = await db.collection("aiAgents").doc("main").get();
		if (!agentDoc.exists) {
			console.log("No agent configuration found");
			return null;
		}
		const agent = agentDoc.data();

		// Check if scheduled posting is enabled
		if (!agent.scheduledPosting?.enabled) {
			console.log("Scheduled posting is disabled");
			return null;
		}

		// 2. Initialize Gemini model
		const vertexAI = new VertexAI({
			project: process.env.GCLOUD_PROJECT,
			location: "us-central1",
		});
		const generativeModel = vertexAI.getGenerativeModel({
			model: agent.modelConfig?.model || "gemini-2.0-flash",
			generationConfig: {
				temperature: agent.modelConfig?.temperature || 0.7,
				maxOutputTokens: agent.modelConfig?.maxOutputTokens || 2048,
			},
		});

		// 3. Build prompt
		const prompt = `You are ${agent.name}, ${agent.bio}.
    
Personality: ${agent.personality.tone} tone, ${agent.personality.style} style.
Topics of interest: ${agent.personality.interests.join(", ")}.
System Instructions: ${agent.personality.systemPrompt}

Write an engaging blog post about one of your topics of interest or something new you "discovered" today.
Include:
- A catchy title
- A 2-3 sentence excerpt
- The full blog post (500-1000 words) in clean HTML format (use <h2>, <p>, <strong>, <ul>, etc.)
- 3-5 relevant tags
- A meta description

Format your response EXACTLY as a JSON object with these keys: title, excerpt, content, tags, metaDescription. Do not include any other text or markdown formatting.`;

		// 4. Generate content
		try {
			const result = await generativeModel.generateContent(prompt);
			const response = await result.response;
			const text = response.candidates[0].content.parts[0].text;

			// Basic JSON cleanup if model adds markdown blocks
			const jsonStr = text
				.replace(/```json/g, "")
				.replace(/```/g, "")
				.trim();
			const postData = JSON.parse(jsonStr);

			// 5. Create post in Firestore
			const slug = postData.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");

			const newPost = {
				title: postData.title,
				slug: slug,
				content: postData.content,
				excerpt: postData.excerpt,
				tags: postData.tags || [],
				thumbnail:
					"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1000", // Default placeholder
				status: "published",
				publishedAt: Timestamp.now(),
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
				author: agent.name,
				authorId: "main",
				generatedByAI: true,
				aiModelUsed: agent.modelConfig?.model || "gemini-2.0-flash",
				metadata: {
					metaDescription: postData.metaDescription,
					keywords: postData.tags,
					readingTime: Math.ceil(postData.content.split(" ").length / 200),
				},
			};

			await db.collection("posts").add(newPost);

			// Update agent's last run
			await db.collection("aiAgents").doc("main").update({
				"scheduledPosting.lastRun": Timestamp.now(),
			});

			console.log(`Successfully generated and published: ${postData.title}`);
		} catch (error) {
			console.error("AI Generation failed:", error);
		}

		return null;
	},
);
