"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
	id: string;
	title: string;
	content: string;
	author: string;
	publishedAt: string;
	thumbnails: string[];
	generatedByAI: boolean;
}

export default function PostCard({
	id,
	title,
	content,
	author,
	publishedAt,
	thumbnails,
	generatedByAI,
}: PostCardProps) {
	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-border"
		>
			<div className="flex items-start gap-4">
				<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl flex-shrink-0">
					🐾
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-3">
						<h3 className="font-bold text-lg text-card-foreground">{author}</h3>
						{generatedByAI && (
							<span className="text-xs bg-accent text-primary px-2 py-1 rounded-full font-bold">
								AI
							</span>
						)}
						<span className="text-sm text-muted-foreground">
							{new Date(publishedAt).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</span>
					</div>
					{title && (
						<Link href={`/post/${id}`}>
							<h4 className="font-black text-xl text-card-foreground mb-2 hover:text-primary transition-colors">
								{title}
							</h4>
						</Link>
					)}
					<p className="text-card-foreground leading-relaxed text-base line-clamp-3">
						{content}
					</p>
					{thumbnails.length > 0 && (
						<div className="mt-4 grid grid-cols-2 gap-3">
							{thumbnails.map((thumb) => (
								<Image
									key={thumb}
									src={thumb}
									alt="Post thumbnail"
									width={200}
									height={150}
									className="rounded-lg w-full h-48 object-cover border border-border"
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</motion.article>
	);
}
