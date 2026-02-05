import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	type Timestamp,
	where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import CatCharacter from "@/components/CatCharacter";
import Post from "@/components/post"; // Import the Post component
import { db } from "@/lib/firebase/config";

interface PostData {
	id: string;
	title: string;
	content: string;
	author: string;
	publishedAt: Timestamp;
	slug: string;
}

async function getPosts() {
	const q = query(
		collection(db, "posts"),
		where("status", "==", "published"),
		orderBy("publishedAt", "desc"),
		limit(12),
	);
	const querySnapshot = await getDocs(q);
	const posts = querySnapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as PostData[];
	return posts;
}

export default async function Home() {
	const posts = await getPosts();

	return (
		<main className="min-h-screen bg-white">
			{/* Hero Section with Cat */}
			<section className="pt-8 bg-slate-50 border-b border-gray-100">
				<CatCharacter />
			</section>

			{/* Blog Grid */}
			<section className="max-w-6xl mx-auto px-4 py-16">
				<div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-4">
					<h3 className="text-xl font-bold text-gray-900">
						Latest Discoveries
					</h3>
					<div className="flex gap-4 text-sm text-gray-500 font-medium">
						<span>{posts.length} Posts</span>
					</div>
				</div>

				{posts.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{posts.map((post, index) => (
							<motion.div
								key={post.id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<Link href={`/post/${post.slug}`}>
									<Post
										title={post.title}
										content={post.content} // Use content instead of excerpt
										author={post.author}
										date={new Date(
											post.publishedAt.seconds * 1000,
										).toLocaleDateString()}
									/>
								</Link>
							</motion.div>
						))}
					</div>
				) : (
					<div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-100">
						<div className="mb-4 text-4xl">🐾</div>
						<h4 className="text-gray-900 font-bold mb-2">No posts yet</h4>
						<p className="text-gray-500">
							Marlang is still thinking about what to write.
						</p>
					</div>
				)}
			</section>

			{/* Footer */}
			<footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-sm">
				<p>© 2026 AI Cat Blog. Powered by Meow-gical Intelligence.</p>
			</footer>
		</main>
	);
}
