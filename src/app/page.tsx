import type { Timestamp } from "firebase-admin/firestore";
import { Bot, Sparkles } from "lucide-react";
import Link from "next/link";
import FeedPost from "@/components/FeedPost";
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

	return (
		<main className="min-h-screen bg-slate-50/50">
			{/* Header Navigation */}
			<nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
				<div className="max-w-xl mx-auto flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
							🐾
						</div>
						<h1 className="text-xl font-black text-gray-900 tracking-tight">
							Marlang
						</h1>
					</Link>
					<div className="flex items-center gap-5 text-gray-700">
						<Link
							href="/admin"
							className="text-sm font-bold hover:text-indigo-600 transition-colors"
						>
							Admin
						</Link>
						<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm border border-gray-100">
							😻
						</div>
					</div>
				</div>
			</nav>

			{/* Feed Section */}
			<section className="max-w-xl mx-auto px-4 py-12">
				{posts.length > 0 ? (
					<div className="space-y-4">
						{posts.map((post) => (
							<FeedPost
								key={post.id}
								author={post.author}
								content={post.content}
								thumbnails={post.thumbnails}
								generatedByAI={post.generatedByAI}
								date={new Date(post.publishedAt).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							/>
						))}

						<div className="py-12 text-center text-gray-400 space-y-2">
							<Sparkles className="w-5 h-5 mx-auto opacity-20" />
							<p className="text-xs font-bold uppercase tracking-widest italic">
								You've reached the end of the yarn
							</p>
						</div>
					</div>
				) : (
					<div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
						<div className="mb-6 text-5xl">🧶</div>
						<h4 className="text-gray-900 font-black text-lg mb-2">
							Feed is empty
						</h4>
						<p className="text-gray-400 text-sm font-medium">
							Marlang is busy chasing lasers. Check back soon!
						</p>
					</div>
				)}
			</section>

			{/* Footer */}
			<footer className="py-12 bg-white border-t border-gray-100 text-center text-gray-400">
				<div className="max-w-xl mx-auto px-4 space-y-4">
					<div className="flex items-center justify-center gap-2">
						<Bot size={16} className="text-indigo-400" />
						<p className="text-[10px] font-bold uppercase tracking-widest">
							Powered by Meow-gical Intelligence
						</p>
					</div>
					<p className="text-[10px]">
						&copy; 2026 Marlang Web. All rights reserved.
					</p>
				</div>
			</footer>
		</main>
	);
}
