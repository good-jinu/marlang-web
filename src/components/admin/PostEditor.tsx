"use client";

import {
	collection,
	doc,
	type FieldValue,
	getDoc,
	serverTimestamp,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Loader2, Plus, X } from "lucide-react";
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
	const [content, setContent] = useState("");
	const [status, setStatus] = useState("published");
	const [tags, setTags] = useState("");
	const [thumbnails, setThumbnails] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);

	const fetchPost = useCallback(async () => {
		try {
			const docRef = doc(db, "posts", id as string);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				setContent(data.content || "");
				setStatus(data.status || "published");
				setTags(data.tags?.join(", ") || "");
				// Handle legacy single thumbnail or new thumbnails array
				if (data.thumbnails) {
					setThumbnails(data.thumbnails);
				} else if (data.thumbnail) {
					setThumbnails([data.thumbnail]);
				}
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

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		setUploading(true);
		try {
			const newUrls: string[] = [];
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const storageRef = ref(
					storage,
					`post-images/${Date.now()}-${file.name}`,
				);
				await uploadBytes(storageRef, file);
				const url = await getDownloadURL(storageRef);
				newUrls.push(url);
			}
			setThumbnails((prev) => [...prev, ...newUrls]);
		} catch (error) {
			console.error("Upload failed:", error);
			alert("Some images failed to upload.");
		} finally {
			setUploading(false);
		}
	};

	const removeThumbnail = (index: number) => {
		setThumbnails((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = async (e: React.SubmitEvent) => {
		e.preventDefault();
		if (thumbnails.length === 0) {
			alert("Please upload at least one thumbnail.");
			return;
		}
		setSaving(true);

		// Simplified schema: content and thumbnails are primary
		const postData: {
			content: string;
			thumbnails: string[];
			status: string;
			tags: string[];
			updatedAt: FieldValue;
			author: string;
			authorId: string;
			metadata: { imageCount: number };
			title?: string;
		} = {
			content,
			thumbnails,
			status,
			tags: tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
			updatedAt: serverTimestamp(),
			author: "Marlang the Cat",
			authorId: "main",
			metadata: {
				imageCount: thumbnails.length,
			},
		};

		// Keep title for backward compatibility if needed,
		// but derive it if it doesn't exist
		postData.title = content.slice(0, 50) + (content.length > 50 ? "..." : "");

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
			<div className="flex items-center justify-center p-20 text-muted-foreground">
				<Loader2 className="w-6 h-6 animate-spin mr-2" />
				Loading editor...
			</div>
		);

	return (
		<div className="max-w-2xl mx-auto space-y-8 pb-20">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						{isEditing ? "Edit Post" : "New Post"}
					</h1>
					<p className="text-muted-foreground text-sm">
						Share a moment with the world.
					</p>
				</div>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => router.back()}
						className="px-5 py-2 rounded-xl border border-border text-secondary-foreground font-medium hover:bg-muted transition-colors"
					>
						Cancel
					</button>
					<button
						form="post-form"
						type="submit"
						disabled={saving || uploading}
						className="px-8 py-2 rounded-xl bg-primary text-primary-foreground font-bold  transition-all shadow-lg  disabled:opacity-50 disabled:shadow-none"
					>
						{saving ? "Saving..." : "Post"}
					</button>
				</div>
			</div>

			<form id="post-form" onSubmit={handleSave} className="space-y-8">
				<div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
					{/* Thumbnail Gallery Editor */}
					<div className="p-8 border-b border-border space-y-4">
						<span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
							Photos (Multiple allowed, at least one required)
						</span>

						<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
							{thumbnails.map((url, index) => (
								<div
									key={url}
									className="relative aspect-square rounded-xl overflow-hidden group border border-border"
								>
									<Image
										src={url}
										alt={`Thumbnail ${index + 1}`}
										fill
										className="object-cover"
									/>
									<button
										type="button"
										onClick={() => removeThumbnail(index)}
										className="absolute top-2 right-2 p-1.5 bg-muted/50 text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/70"
									>
										<X size={14} />
									</button>
									{index === 0 && (
										<span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-md">
											Cover
										</span>
									)}
								</div>
							))}

							<label
								className={`aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleImageUpload}
									disabled={uploading}
									className="hidden"
								/>
								{uploading ? (
									<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
								) : (
									<>
										<Plus className="w-6 h-6 text-muted-foreground mb-1" />
										<span className="text-xs text-muted-foreground font-medium">
											Add Photo
										</span>
									</>
								)}
							</label>
						</div>
					</div>

					{/* Content / Caption */}
					<div className="p-8 space-y-6">
						<div className="space-y-2">
							<label
								htmlFor="post-content"
								className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
							>
								Caption
							</label>
							<textarea
								id="post-content"
								required
								rows={8}
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Write a caption..."
								className="w-full px-0 py-2 text-lg border-none focus:ring-0 outline-none resize-none placeholder:text-muted-foreground"
							/>
						</div>

						<div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label
									htmlFor="post-tags"
									className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
								>
									Tags
								</label>
								<div className="flex items-center border border-border rounded-xl px-4 focus-within:ring-2 focus-within:ring-ring transition-all">
									<span className="text-muted-foreground mr-1">#</span>
									<input
										id="post-tags"
										type="text"
										value={tags}
										onChange={(e) => setTags(e.target.value)}
										placeholder="cats, adventure, daily"
										className="w-full py-3 border-none focus:ring-0 outline-none text-sm"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="post-status"
									className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
								>
									Visibility
								</label>
								<select
									id="post-status"
									value={status}
									onChange={(e) => setStatus(e.target.value)}
									className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-ring outline-none transition-all bg-card text-sm"
								>
									<option value="published">Public</option>
									<option value="draft">Private Draft</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
