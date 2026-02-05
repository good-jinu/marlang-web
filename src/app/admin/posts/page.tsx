"use client";

import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	type Timestamp,
} from "firebase/firestore";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";

interface Post {
	id: string;
	title: string;
	status: string;
	publishedAt: Timestamp;
	createdAt: Timestamp;
	slug: string;
	generatedByAI: boolean;
}

export default function PostsManagement() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchPosts = useCallback(async () => {
		setLoading(true);
		try {
			const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
			const snapshot = await getDocs(q);
			setPosts(
				snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Post),
			);
		} catch (error) {
			console.error("Error fetching posts:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPosts();
	}, [fetchPosts]);

	async function handleDelete(id: string) {
		if (
			confirm(
				"Are you sure you want to delete this post? This action cannot be undone.",
			)
		) {
			try {
				await deleteDoc(doc(db, "posts", id));
				setPosts(posts.filter((p) => p.id !== id));
			} catch (_error) {
				alert("Failed to delete post.");
			}
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
					<p className="text-gray-500 text-sm">
						Manage your blog content and drafts.
					</p>
				</div>
				<Link
					href="/admin/posts/new"
					className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
				>
					+ New Post
				</Link>
			</div>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-gray-50 border-b border-gray-100">
							<tr>
								<th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
									Title
								</th>
								<th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
									Published
								</th>
								<th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
									AI Generated
								</th>
								<th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{loading ? (
								[1, 2, 3].map((i) => (
									<tr key={i} className="animate-pulse">
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-100 rounded w-48"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-100 rounded w-16"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-100 rounded w-24"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-100 rounded w-10"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-100 rounded w-12"></div>
										</td>
									</tr>
								))
							) : posts.length > 0 ? (
								posts.map((post) => (
									<tr
										key={post.id}
										className="hover:bg-gray-50 transition-colors"
									>
										<td className="px-6 py-4">
											<p className="text-sm font-bold text-gray-900 line-clamp-1">
												{post.title}
											</p>
											<p className="text-[10px] text-gray-400 font-mono tracking-tighter">
												/{post.slug}
											</p>
										</td>
										<td className="px-6 py-4">
											<span
												className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
													post.status === "published"
														? "bg-green-50 text-green-600"
														: "bg-yellow-50 text-yellow-600"
												}`}
											>
												{post.status}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-gray-500">
											{post.publishedAt?.toDate().toLocaleDateString() ||
												"Not published"}
										</td>
										<td className="px-6 py-4">
											{post.generatedByAI ? (
												<span className="text-xl" title="AI Generated">
													🤖
												</span>
											) : (
												<span className="text-xl" title="Manual Post">
													✍️
												</span>
											)}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<Link
													href={`/admin/posts/edit/${post.id}`}
													className="text-gray-400 hover:text-indigo-600 transition-colors"
												>
													<svg
														className="w-5 h-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<title>Edit post</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.364a2.5 2.5 0 113.536 3.536L12.5 21H9v-3.536L18.364 5.364z"
														/>
													</svg>
												</Link>
												<button
													type="button"
													onClick={() => handleDelete(post.id)}
													className="text-gray-400 hover:text-red-600 transition-colors"
												>
													<svg
														className="w-5 h-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<title>Delete post</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-12 text-center text-gray-400"
									>
										No posts yet. Start by creating one!
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
