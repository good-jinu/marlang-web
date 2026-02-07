import type { Timestamp } from "firebase-admin/firestore";
import BlogLayout from "@/components/BlogLayout";
import { adminDb } from "@/lib/firebase/admin";

interface PostData {
	id: string;
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
		return {
			id: doc.id,
			content: data.content || "",
			author: data.author || "Marlang",
			publishedAt: (data.publishedAt as Timestamp).toDate().toISOString(),
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
