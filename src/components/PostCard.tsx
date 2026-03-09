"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface PostCardProps {
	id: string;
	title: string;
	content: string;
	author: string;
	publishedAt: string;
	thumbnails: string[];
	generatedByAI?: boolean;
}

export default function PostCard({
	id,
	title,
	content,
	author,
	publishedAt,
	thumbnails,
}: PostCardProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextSlide = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentIndex((prev) => (prev === thumbnails.length - 1 ? 0 : prev + 1));
	};

	const prevSlide = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentIndex((prev) => (prev === 0 ? thumbnails.length - 1 : prev - 1));
	};

	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-md transition-all hover:shadow-xl"
		>
			{/* Thumbnail Slider Section */}
			{thumbnails.length > 0 && (
				<div className="relative aspect-square overflow-hidden bg-muted">
					{/* The Sliding Track */}
					<motion.div
						className="flex h-full w-full"
						animate={{ x: `-${currentIndex * 100}%` }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
					>
						{thumbnails.map((src, index) => (
							<div key={src} className="relative h-full min-w-full">
								<Image
									src={src}
									alt={title || "Post thumbnail"}
									fill
									// Optimization: Load first image immediately,
									// second image early, others lazily.
									priority={index === 0}
									loading={index === 0 ? "eager" : "lazy"}
									className="object-cover transition-transform duration-700 group-hover:scale-105"
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									draggable={false}
								/>
							</div>
						))}
					</motion.div>

					{/* Navigation Arrows */}
					{thumbnails.length > 1 && (
						<>
							<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-3">
								<button
									type="button"
									onClick={prevSlide}
									className="pointer-events-auto rounded-full bg-black/20 p-2 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/50 group-hover:opacity-100"
									aria-label="Previous image"
								>
									<ChevronLeft width={20} height={20} />
								</button>
								<button
									type="button"
									onClick={nextSlide}
									className="pointer-events-auto rounded-full bg-black/20 p-2 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/50 group-hover:opacity-100"
									aria-label="Next image"
								>
									<ChevronRight width={20} height={20} />
								</button>
							</div>

							{/* Pagination Dots */}
							<div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
								{thumbnails.map((_, index) => (
									<button
										key={_}
										type="button"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setCurrentIndex(index);
										}}
										className={`h-1.5 rounded-full transition-all duration-300 ${
											index === currentIndex
												? "w-4 bg-white"
												: "w-1.5 bg-white/40"
										}`}
										aria-label={`Go to image ${index + 1}`}
									/>
								))}
							</div>
						</>
					)}
				</div>
			)}

			{/* Content Section */}
			<div className="flex flex-1 flex-col p-5 sm:p-7">
				<div className="flex-1">
					{title && (
						<Link href={`/post/${id}`}>
							<h4 className="mb-3 text-xl font-black leading-tight text-card-foreground transition-colors hover:text-primary sm:text-2xl">
								{title}
							</h4>
						</Link>
					)}
					<p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
						{content}
					</p>
				</div>

				<div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-sm">
							🐾
						</div>
						<div className="flex flex-col">
							<span className="mb-0.5 text-xs font-bold leading-none text-card-foreground">
								{author}
							</span>
							<span className="text-[10px] font-medium text-muted-foreground">
								{new Date(publishedAt).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</span>
						</div>
					</div>

					<Link
						href={`/post/${id}`}
						className="text-xs font-bold text-primary underline-offset-4 hover:underline"
					>
						Read More →
					</Link>
				</div>
			</div>
		</motion.article>
	);
}
