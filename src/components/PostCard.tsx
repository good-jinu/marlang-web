"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
	id: string;
	title: string;
	slug: string;
	content: string;
	author: string;
	publishedAt: string;
	thumbnails: string[];
	generatedByAI: boolean;
}

export default function PostCard({
	title,
	slug,
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
			className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100"
		>
			<div className="flex items-start gap-4">
				<div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
					🐾
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-3">
						<h3 className="font-bold text-lg text-gray-900">{author}</h3>
						{generatedByAI && (
							<span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-bold">
								AI
							</span>
						)}
						<span className="text-sm text-gray-400">
							{new Date(publishedAt).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</span>
					</div>
					{title && (
						<Link href={`/post/${slug}`}>
							<h4 className="font-black text-xl text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
								{title}
							</h4>
						</Link>
					)}
					<p className="text-gray-700 leading-relaxed text-base line-clamp-3">
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
									className="rounded-lg w-full h-48 object-cover border border-gray-200"
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</motion.article>
	);
}
