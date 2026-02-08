"use client";

import { AnimatePresence, motion } from "framer-motion";
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
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextSlide = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentIndex((prevIndex) =>
			prevIndex === thumbnails.length - 1 ? 0 : prevIndex + 1,
		);
	};

	const prevSlide = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? thumbnails.length - 1 : prevIndex - 1,
		);
	};

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
						<div className="mt-6 relative group overflow-hidden rounded-xl border border-border aspect-video bg-muted">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentIndex}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.2 }}
									className="absolute inset-0"
								>
									<Image
										src={thumbnails[currentIndex]}
										alt={`Thumbnail ${currentIndex + 1}`}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 100vw, 768px"
									/>
								</motion.div>
							</AnimatePresence>

							{thumbnails.length > 1 && (
								<>
									<button
										type="button"
										onClick={prevSlide}
										className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
										aria-label="Previous image"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											role="img"
											aria-hidden="true"
										>
											<title>Previous</title>
											<path d="m15 18-6-6 6-6" />
										</svg>
									</button>
									<button
										type="button"
										onClick={nextSlide}
										className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
										aria-label="Next image"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											role="img"
											aria-hidden="true"
										>
											<title>Next</title>
											<path d="m9 18 6-6-6-6" />
										</svg>
									</button>
									<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
										{thumbnails.map((thumb, index) => (
											<button
												key={thumb}
												type="button"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													setCurrentIndex(index);
												}}
												className={`w-2 h-2 rounded-full transition-colors ${
													index === currentIndex ? "bg-white" : "bg-white/50"
												}`}
												aria-label={`Go to slide ${index + 1}`}
											/>
										))}
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</motion.article>
	);
}
