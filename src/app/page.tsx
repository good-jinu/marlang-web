"use client";

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
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CatCharacter from "@/components/CatCharacter";
import { db } from "@/lib/firebase/config";

interface Post {
	id: string;
	title: string;
	excerpt: string;
	thumbnail: string;
	publishedAt: Timestamp;
	slug: string;
}

export default function Home() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchPosts() {
			try {
				const q = query(
					collection(db, "posts"),
					where("status", "==", "published"),
					orderBy("publishedAt", "desc"),
					limit(12),
				);
				const querySnapshot = await getDocs(q);
				const fetchedPosts = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Post[];
				setPosts(fetchedPosts);
			} catch (error) {
				console.error("Error fetching posts:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchPosts();
	}, []);

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

				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="aspect-square bg-gray-100 animate-pulse rounded-lg"
							></div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{posts.map((post, index) => (
							<motion.div
								key={post.id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<Link
									href={`/post/${post.slug}`}
									className="group block relative overflow-hidden rounded-xl bg-gray-100 aspect-square shadow-sm hover:shadow-md transition-shadow"
								>
									{post.thumbnail ? (
										<Image
											src={post.thumbnail}
											alt={post.title}
											width={500}
											height={500}
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
											<svg
												className="w-12 h-12"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<title>Image placeholder</title>
												<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
											</svg>
										</div>
									)}

									{/* Hover Overlay */}
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
										<h4 className="text-white font-bold text-lg mb-2 line-clamp-2">
											{post.title}
										</h4>
										<p className="text-white/80 text-sm line-clamp-2">
											{post.excerpt}
										</p>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				)}

				{!loading && posts.length === 0 && (
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
