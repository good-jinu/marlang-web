"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Bookmark,
	ChevronLeft,
	ChevronRight,
	Heart,
	MessageCircle,
	MoreHorizontal,
	Send,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";

interface FeedPostProps {
	author: string;
	content: string;
	thumbnails: string[];
	date: string;
	generatedByAI?: boolean;
}

const FeedPost: React.FC<FeedPostProps> = ({
	author,
	content,
	thumbnails,
	date,
	generatedByAI,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextImage = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentIndex((prev) => (prev + 1) % thumbnails.length);
	};

	const prevImage = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentIndex(
			(prev) => (prev - 1 + thumbnails.length) % thumbnails.length,
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 max-w-xl mx-auto mb-12"
		>
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-gray-50">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-fuchsia-600 p-[2px]">
						<div className="w-full h-full rounded-full bg-white p-[2px]">
							<div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center text-lg">
								🐾
							</div>
						</div>
					</div>
					<div>
						<div className="flex items-center gap-1.5">
							<span className="font-bold text-sm text-gray-900">{author}</span>
							{generatedByAI && (
								<span className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">
									AI
								</span>
							)}
						</div>
						<p className="text-[10px] text-gray-400 font-medium">{date}</p>
					</div>
				</div>
				<button type="button" className="text-gray-400 hover:text-gray-600 p-1">
					<MoreHorizontal size={20} />
				</button>
			</div>

			{/* Image Carousel */}
			<div className="relative aspect-square bg-gray-50 flex items-center justify-center group">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentIndex}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="relative w-full h-full"
					>
						<Image
							src={thumbnails[currentIndex]}
							alt={`Post image ${currentIndex + 1}`}
							fill
							className="object-cover"
							priority={currentIndex === 0}
						/>
					</motion.div>
				</AnimatePresence>

				{thumbnails.length > 1 && (
					<>
						<button
							type="button"
							onClick={prevImage}
							className="absolute left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 border border-white/30"
						>
							<ChevronLeft size={20} />
						</button>
						<button
							type="button"
							onClick={nextImage}
							className="absolute right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 border border-white/30"
						>
							<ChevronRight size={20} />
						</button>

						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 transition-opacity">
							{thumbnails.map((url, i) => (
								<div
									key={url}
									className={`w-1.5 h-1.5 rounded-full transition-all ${
										i === currentIndex ? "bg-white scale-125" : "bg-white/40"
									}`}
								/>
							))}
						</div>
					</>
				)}
			</div>

			{/* Actions */}
			<div className="p-4 space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4 text-gray-700">
						<button
							type="button"
							className="hover:text-rose-500 transition-colors"
						>
							<Heart size={24} />
						</button>
						<button
							type="button"
							className="hover:text-indigo-500 transition-colors"
						>
							<MessageCircle size={24} />
						</button>
						<button
							type="button"
							className="hover:text-amber-500 transition-colors"
						>
							<Send size={24} />
						</button>
					</div>
					<button
						type="button"
						className="text-gray-700 hover:text-gray-900 transition-colors"
					>
						<Bookmark size={24} />
					</button>
				</div>

				<div className="space-y-1.5">
					<p className="text-sm text-gray-800 leading-relaxed font-medium">
						<span className="font-bold mr-2">{author}</span>
						{content}
					</p>
					<button
						type="button"
						className="text-[11px] text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-tight"
					>
						View all 12 comments
					</button>
				</div>
			</div>
		</motion.div>
	);
};

export default FeedPost;
