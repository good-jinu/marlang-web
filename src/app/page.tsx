import type { Timestamp } from "firebase-admin/firestore";
import BlogLayout from "@/components/BlogLayout";
import { adminDb } from "@/lib/firebase/admin";

interface PostData {
	id: string;
	title: string;
	content: string;
	author: string;
	publishedAt: string;
	thumbnails: string[];
	generatedByAI: boolean;
}

async function getPosts(): Promise<PostData[]> {
	const postsRef = adminDb.collection("posts");
	const q = postsRef
		.where("status", "==", "published")
		.orderBy("publishedAt", "desc")
		.limit(20);

	const querySnapshot = await q.get();

	if (querySnapshot.empty) {
		return [];
	}

	const posts = querySnapshot.docs.map((doc) => {
		const data = doc.data();
		console.log("data: ", JSON.stringify(data));
		return {
			id: doc.id,
			title: data.title || data.content?.slice(0, 50) || "Untitled moment",
			content: data.content || "",
			author: data.author || "Marlang",
			publishedAt: data.publishedAt
				? (data.publishedAt as Timestamp).toDate().toISOString()
				: (data.createdAt as Timestamp)?.toDate().toISOString() ||
				new Date().toISOString(),
			thumbnails: data.thumbnails || (data.thumbnail ? [data.thumbnail] : []),
			generatedByAI: !!data.generatedByAI,
		};
	});

	return posts;
}

export default async function Home() {
	const posts = await getPosts();

	return <BlogLayout posts={posts} />;
}
