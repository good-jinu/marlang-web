"use client";

import {
	collection,
	doc,
	getDoc,
	serverTimestamp,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase/config";

export default function PostEditor() {
	const router = useRouter();
	const { id } = useParams();
	const isEditing = !!id;

	const [loading, setLoading] = useState(isEditing);
	const [saving, setSaving] = useState(false);
	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [content, setContent] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [status, setStatus] = useState("draft");
	const [tags, setTags] = useState("");
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	const fetchPost = useCallback(async () => {
		try {
			const docRef = doc(db, "posts", id as string);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				setTitle(data.title);
				setSlug(data.slug);
				setContent(data.content);
				setExcerpt(data.excerpt);
				setStatus(data.status);
				setTags(data.tags?.join(", ") || "");
				setThumbnail(data.thumbnail);
			}
		} catch (error) {
			console.error("Error fetching post:", error);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		if (isEditing) {
			fetchPost();
		}
	}, [fetchPost, isEditing]);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setTitle(val);
		if (!isEditing) {
			setSlug(
				val
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, ""),
			);
		}
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		try {
			const storageRef = ref(storage, `post-images/${Date.now()}-${file.name}`);
			await uploadBytes(storageRef, file);
			const url = await getDownloadURL(storageRef);
			setThumbnail(url);
		} catch (error) {
			console.error("Upload failed:", error);
			alert("Image upload failed.");
		} finally {
			setUploading(false);
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);

		const postData = {
			title,
			slug,
			content,
			excerpt,
			status,
			tags: tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
			thumbnail,
			updatedAt: serverTimestamp(),
			author: "Marlang the Cat",
			authorId: "main",
			metadata: {
				readingTime: Math.ceil(content.split(" ").length / 200),
			},
		};

		try {
			if (isEditing) {
				await updateDoc(doc(db, "posts", id as string), postData);
			} else {
				const newDocRef = doc(collection(db, "posts"));
				await setDoc(newDocRef, {
					...postData,
					createdAt: serverTimestamp(),
					publishedAt: status === "published" ? serverTimestamp() : null,
					generatedByAI: false,
				});
			}
			router.push("/admin/posts");
		} catch (error) {
			console.error("Save failed:", error);
			alert("Failed to save post.");
		} finally {
			setSaving(false);
		}
	};

	if (loading)
		return (
			<div className="p-8 text-center text-gray-400">Loading editor...</div>
		);

	return (
		<div className="max-w-4xl mx-auto space-y-8 pb-20">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						{isEditing ? "Edit Post" : "Create New Post"}
					</h1>
					<p className="text-gray-500 text-sm">
						Write something meow-wonderful.
					</p>
				</div>
				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => router.back()}
						className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						form="post-form"
						type="submit"
						disabled={saving}
						className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
					>
						{saving ? "Saving..." : "Save Post"}
					</button>
				</div>
			</div>

			<form id="post-form" onSubmit={handleSave} className="space-y-8">
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
					{/* Title & Slug */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label
								htmlFor="post-title"
								className="text-xs font-bold text-gray-500 uppercase tracking-wider"
							>
								Title
							</label>
							<input
								id="post-title"
								required
								type="text"
								value={title}
								onChange={handleTitleChange}
								placeholder="Post title"
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="post-slug"
								className="text-xs font-bold text-gray-500 uppercase tracking-wider"
							>
								URL Slug
							</label>
							<input
								id="post-slug"
								required
								type="text"
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								placeholder="url-slug"
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50"
							/>
						</div>
					</div>

					{/* Excerpt */}
					<div className="space-y-2">
						<label
							htmlFor="post-excerpt"
							className="text-xs font-bold text-gray-500 uppercase tracking-wider"
						>
							Excerpt (Brief Summary)
						</label>
						<textarea
							id="post-excerpt"
							rows={2}
							value={excerpt}
							onChange={(e) => setExcerpt(e.target.value)}
							placeholder="What is this post about?"
							className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
						/>
					</div>

					{/* Thumbnail */}
					<div className="space-y-2">
						<label
							htmlFor="image-upload"
							className="text-xs font-bold text-gray-500 uppercase tracking-wider"
						>
							Thumbnail Image
						</label>
						<div className="flex items-start gap-6">
							<div className="w-40 aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative">
								{thumbnail ? (
									<Image
										src={thumbnail}
										alt={title}
										width={160}
										height={160}
										sizes="160px"
										className="w-full h-full object-cover"
									/>
								) : (
									<span className="text-gray-300 text-3xl">🖼️</span>
								)}
								{uploading && (
									<div className="absolute inset-0 bg-white/60 flex items-center justify-center animate-pulse">
										Wait...
									</div>
								)}
							</div>
							<div className="flex-1 space-y-4 pt-2">
								<input
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
									className="hidden"
									id="image-upload"
								/>
								<label
									htmlFor="image-upload"
									className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold cursor-pointer hover:bg-indigo-100 transition-colors"
								>
									{thumbnail ? "Change Image" : "Upload Image"}
								</label>
								<p className="text-xs text-gray-400">
									Max size: 5MB. Recommended: 800x800px
								</p>
							</div>
						</div>
					</div>

					{/* Rich Text / Content */}
					<div className="space-y-2">
						<label
							htmlFor="post-content"
							className="text-xs font-bold text-gray-500 uppercase tracking-wider"
						>
							Content (HTML Supported)
						</label>
						<textarea
							id="post-content"
							required
							rows={15}
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Paste your HTML content here..."
							className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
						/>
					</div>

					{/* Tags & Status */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label
								htmlFor="post-tags"
								className="text-xs font-bold text-gray-500 uppercase tracking-wider"
							>
								Tags (comma separated)
							</label>
							<input
								id="post-tags"
								type="text"
								value={tags}
								onChange={(e) => setTags(e.target.value)}
								placeholder="tech, lifestyle, cat-nip"
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="post-status"
								className="text-xs font-bold text-gray-500 uppercase tracking-wider"
							>
								Status
							</label>
							<select
								id="post-status"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
							>
								<option value="draft">Draft (Private)</option>
								<option value="published">Published (Public)</option>
							</select>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
