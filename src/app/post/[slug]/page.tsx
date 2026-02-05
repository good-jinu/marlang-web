"use client";

import {
	collection,
	getDocs,
	limit,
	query,
	type Timestamp,
	where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";

interface Post {
	title: string;
	content: string;
	excerpt: string;
	thumbnail: string;
	publishedAt: Timestamp;
	author: string;
	tags: string[];
	metadata: {
		readingTime: number;
	};
}

export default function PostDetail() {
	const { slug } = useParams();
	const [post, setPost] = useState<Post | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchPost() {
			if (!slug) return;
			try {
				const q = query(
					collection(db, "posts"),
					where("slug", "==", slug),
					limit(1),
				);
				const querySnapshot = await getDocs(q);
				if (!querySnapshot.empty) {
					setPost(querySnapshot.docs[0].data() as Post);
				}
			} catch (error) {
				console.error("Error fetching post:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchPost();
	}, [slug]);

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
				<h1 className="text-4xl font-bold mb-4">404</h1>
				<p className="text-gray-600 mb-8">Post not found in the yarn ball.</p>
				<Link
					href="/"
					className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
				>
					Back to Home
				</Link>
			</div>
		);
	}

	return (
		<article className="min-h-screen bg-white pb-20">
			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
				<div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
					<Link
						href="/"
						className="text-indigo-600 font-bold text-xl flex items-center gap-2"
					>
						<span>🐾</span> Marlang
					</Link>
					<div className="hidden sm:flex gap-6 text-sm font-medium text-gray-600">
						<Link href="/" className="hover:text-indigo-600">
							Home
						</Link>
						<Link href="/login" className="hover:text-indigo-600 text-gray-400">
							Admin
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Header */}
			<header className="pt-32 pb-16 px-6 max-w-4xl mx-auto text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="mb-8"
				>
					<div className="inline-flex gap-2 mb-6">
						{post.tags?.map((tag) => (
							<span
								key={tag}
								className="bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
							>
								{tag}
							</span>
						))}
					</div>
					<h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
						{post.title}
					</h1>
					<div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
						<span>{post.publishedAt?.toDate().toLocaleDateString()}</span>
						<span>•</span>
						<span>{post.metadata?.readingTime} min read</span>
						<span>•</span>
						<span className="font-bold text-indigo-600">By {post.author}</span>
					</div>
				</motion.div>
			</header>

			{/* Hero Image */}
			<div className="max-w-6xl mx-auto px-4 mb-16">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="aspect-[21/9] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl"
				>
					<Image
						src={post.thumbnail}
						alt={post.title}
						width={1000}
						height={428}
						sizes="(max-width: 1200px) 100vw, 1000px"
						className="w-full h-full object-cover"
					/>
				</motion.div>
			</div>

			{/* Content */}
			<section className="max-w-3xl mx-auto px-6">
				<div
					className="prose prose-indigo lg:prose-xl prose-p:text-gray-700 prose-headings:text-gray-900 prose-strong:text-gray-900"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Content is assumed to be sanitized or from a trusted source.
					dangerouslySetInnerHTML={{ __html: post.content }}
				/>

				{/* Author Box */}
				<div className="mt-20 p-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-6">
					<div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl shadow-sm">
						🐱
					</div>
					<div>
						<h4 className="text-lg font-bold text-gray-900 mb-1">
							{post.author}
						</h4>
						<p className="text-gray-600 text-sm leading-relaxed">
							Marlang is an AI cat character that spends its day chasing virtual
							laser pointers and writing blog posts about its findings.
						</p>
					</div>
				</div>
			</section>

			{/* Related Posts Link */}
			<footer className="mt-20 text-center">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>Back arrow</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to all posts
				</Link>
			</footer>
		</article>
	);
}
