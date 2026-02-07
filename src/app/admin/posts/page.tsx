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
import { Edit, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";

interface Post {
	id: string;
	title: string;
	content: string;
	status: string;
	publishedAt: Timestamp;
	createdAt: Timestamp;
	slug: string;
	generatedByAI: boolean;
	thumbnails?: string[];
	thumbnail?: string; // legacy
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
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
						Posts
					</h1>
					<p className="text-gray-500 text-sm mt-1">
						Showing all {posts.length} moments.
					</p>
				</div>
				<Link
					href="/admin/posts/new"
					className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
				>
					<span>+ New Moment</span>
				</Link>
			</div>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-gray-50/50 border-b border-gray-100">
							<tr>
								<th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
									Post
								</th>
								<th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
									Date
								</th>
								<th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
									Source
								</th>
								<th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{loading ? (
								[1, 2, 3].map((i) => (
									<tr key={i} className="animate-pulse">
										<td className="px-8 py-6">
											<div className="flex items-center gap-4">
												<div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
												<div className="space-y-2">
													<div className="h-4 bg-gray-100 rounded w-48"></div>
													<div className="h-3 bg-gray-50 rounded w-24"></div>
												</div>
											</div>
										</td>
										<td className="px-6 py-6">
											<div className="h-4 bg-gray-100 rounded w-16"></div>
										</td>
										<td className="px-6 py-6">
											<div className="h-4 bg-gray-100 rounded w-24"></div>
										</td>
										<td className="px-6 py-6">
											<div className="h-4 bg-gray-100 rounded w-10"></div>
										</td>
										<td className="px-8 py-6 text-right">
											<div className="h-4 bg-gray-100 rounded w-20 ml-auto"></div>
										</td>
									</tr>
								))
							) : posts.length > 0 ? (
								posts.map((post) => {
									const mainThumbnail = post.thumbnails?.[0] || post.thumbnail;
									return (
										<tr
											key={post.id}
											className="hover:bg-gray-50/50 transition-colors group"
										>
											<td className="px-8 py-5">
												<div className="flex items-center gap-4">
													<div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
														{mainThumbnail ? (
															<Image
																src={mainThumbnail}
																alt={post.title || "Post thumbnail"}
																fill
																className="object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center text-gray-300">
																<ImageIcon size={20} />
															</div>
														)}
														{post.thumbnails && post.thumbnails.length > 1 && (
															<div className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white text-[8px] font-bold rounded flex items-center justify-center">
																{post.thumbnails.length}
															</div>
														)}
													</div>
													<div>
														<p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
															{post.content || post.title || "No content"}
														</p>
														<p className="text-[10px] text-gray-400 mt-0.5 font-medium">
															{post.slug
																? `/${post.slug}`
																: `ID: ${post.id.slice(0, 8)}`}
														</p>
													</div>
												</div>
											</td>
											<td className="px-6 py-5">
												<span
													className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-tighter ${
														post.status === "published"
															? "bg-emerald-50 text-emerald-600"
															: "bg-amber-50 text-amber-600"
													}`}
												>
													{post.status}
												</span>
											</td>
											<td className="px-6 py-5 text-xs text-gray-500 font-medium">
												{post.publishedAt
													?.toDate()
													.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													}) || "Draft"}
											</td>
											<td className="px-6 py-5">
												{post.generatedByAI ? (
													<span
														className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded"
														title="AI Generated"
													>
														🤖 AI
													</span>
												) : (
													<span
														className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded"
														title="Manual Post"
													>
														👤 SELF
													</span>
												)}
											</td>
											<td className="px-8 py-5 text-right">
												<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
													<Link
														href={`/admin/posts/edit/${post.id}`}
														className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
														title="Edit"
													>
														<Edit size={18} />
													</Link>
													<button
														type="button"
														onClick={() => handleDelete(post.id)}
														className="p-2 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
														title="Delete"
													>
														<Trash2 size={18} />
													</button>
												</div>
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan={5} className="px-6 py-20 text-center">
										<div className="flex flex-col items-center gap-2">
											<div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
												<ImageIcon size={24} />
											</div>
											<h3 className="text-sm font-bold text-gray-900">
												No posts yet
											</h3>
											<p className="text-xs text-gray-400">
												Share your first moment with the world.
											</p>
										</div>
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
