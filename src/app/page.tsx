"use client";

import {
	collection,
	limit,
	onSnapshot,
	orderBy,
	query,
	type Timestamp,
	where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import BlogLayout from "@/components/BlogLayout";
import { db } from "@/lib/firebase/config";

interface PostData {
	id: string;
	title: string;
	content: string;
	author: string;
	publishedAt: string;
	thumbnails: string[];
	generatedByAI: boolean;
}

export default function Home() {
	const [posts, setPosts] = useState<PostData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const postsRef = collection(db, "posts");
		const q = query(
			postsRef,
			where("status", "==", "published"),
			orderBy("publishedAt", "desc"),
			limit(20),
		);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const postsData = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						id: doc.id,
						title:
							data.title || data.content?.slice(0, 50) || "Untitled moment",
						content: data.content || "",
						author: data.author || "Marlang",
						publishedAt: data.publishedAt
							? (data.publishedAt as Timestamp).toDate().toISOString()
							: data.createdAt
								? (data.createdAt as Timestamp).toDate().toISOString()
								: new Date().toISOString(),
						thumbnails:
							data.thumbnails || (data.thumbnail ? [data.thumbnail] : []),
						generatedByAI: !!data.generatedByAI,
					};
				});
				setPosts(postsData);
				setLoading(false);
			},
			(error) => {
				console.error("Error fetching posts:", error);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
					<p className="text-muted-foreground animate-pulse">
						Gathering yarn balls...
					</p>
				</div>
			</div>
		);
	}

	return <BlogLayout posts={posts} />;
}
