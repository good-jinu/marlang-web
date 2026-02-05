"use client";

import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	type Timestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";

interface Stats {
	totalPosts: number;
	publishedPosts: number;
	draftPosts: number;
}

interface Post {
	id: string;
	title: string;
	thumbnail?: string;
	createdAt: Timestamp;
	status: "published" | "draft";
	generatedByAI?: boolean;
}

export default function AdminDashboard() {
	const [stats, setStats] = useState<Stats>({
		totalPosts: 0,
		publishedPosts: 0,
		draftPosts: 0,
	});
	const [recentPosts, setRecentPosts] = useState<Post[]>([]);
	const [_loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDashboardData() {
			try {
				const postsRef = collection(db, "posts");
				const snapshot = await getDocs(postsRef);

				const allPosts = snapshot.docs.map((doc) => doc.data());
				const published = allPosts.filter(
					(p) => p.status === "published",
				).length;
				const drafts = allPosts.filter((p) => p.status === "draft").length;

				setStats({
					totalPosts: allPosts.length,
					publishedPosts: published,
					draftPosts: drafts,
				});

				const q = query(postsRef, orderBy("createdAt", "desc"), limit(5));
				const recentSnapshot = await getDocs(q);
				setRecentPosts(
					recentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
				);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchDashboardData();
	}, []);

	const statsCards = [
		{
			label: "Total Posts",
			value: stats.totalPosts,
			icon: "📝",
			color: "bg-blue-50 text-blue-600",
		},
		{
			label: "Published",
			value: stats.publishedPosts,
			icon: "✅",
			color: "bg-green-50 text-green-600",
		},
		{
			label: "Drafts",
			value: stats.draftPosts,
			icon: "⏳",
			color: "bg-yellow-50 text-yellow-600",
		},
		{
			label: "AI Generated",
			value: recentPosts.filter((p) => p.generatedByAI).length,
			icon: "🤖",
			color: "bg-purple-50 text-purple-600",
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
				<p className="text-gray-500 text-sm">
					Welcome back, Cat Administrator.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{statsCards.map((stat, index) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
					>
						<div
							className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-xl`}
						>
							{stat.icon}
						</div>
						<div>
							<p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
								{stat.label}
							</p>
							<p className="text-2xl font-bold text-gray-900">{stat.value}</p>
						</div>
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Recent Posts List */}
				<div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
						<h3 className="font-bold text-gray-900">Recent Posts</h3>
						<Link
							href="/admin/posts"
							className="text-indigo-600 text-sm font-medium hover:underline"
						>
							View All
						</Link>
					</div>
					<div className="divide-y divide-gray-100">
						{recentPosts.length > 0 ? (
							recentPosts.map((post) => (
								<div
									key={post.id}
									className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
								>
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
											{post.thumbnail && (
												<Image
													src={post.thumbnail}
													alt={post.title}
													width={40}
													height={40}
													sizes="(max-width: 768px) 100vw, 40px"
													className="w-full h-full object-cover"
												/>
											)}
										</div>
										<div>
											<p className="text-sm font-bold text-gray-900 line-clamp-1">
												{post.title}
											</p>
											<p className="text-xs text-gray-500">
												{post.createdAt?.toDate().toLocaleDateString()}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<span
											className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
												post.status === "published"
													? "bg-green-50 text-green-600"
													: "bg-yellow-50 text-yellow-600"
											}`}
										>
											{post.status}
										</span>
										<Link
											href={`/admin/posts/edit/${post.id}`}
											className="text-gray-400 hover:text-indigo-600"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<title>Edit post</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
												/>
											</svg>
										</Link>
									</div>
								</div>
							))
						) : (
							<div className="px-6 py-12 text-center text-gray-400 text-sm">
								No posts found. Start writing!
							</div>
						)}
					</div>
				</div>

				{/* Quick Actions */}
				<div className="space-y-6">
					<div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
						<h3 className="font-bold text-lg mb-2">Grow your blog</h3>
						<p className="text-indigo-100 text-sm mb-6">
							Create a new post or configure the AI agent to automate your
							content.
						</p>
						<Link
							href="/admin/posts/new"
							className="block w-full text-center bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-md"
						>
							+ Create New Post
						</Link>
					</div>

					<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
						<h3 className="font-bold text-gray-900 mb-4">AI Agent Status</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-500">Identity</span>
								<span className="font-medium text-gray-900">
									Marlang the Cat
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-500">Scheduled Posts</span>
								<span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
									Enabled
								</span>
							</div>
							<Link
								href="/admin/agent"
								className="block text-center text-indigo-600 text-sm font-bold pt-2 hover:underline"
							>
								Configure Agent →
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
