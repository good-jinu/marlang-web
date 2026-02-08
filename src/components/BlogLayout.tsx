import { motion } from "framer-motion";
import CatAvatar from "./CatAvatar";
import PostCard from "./PostCard";

interface Post {
	id: string;
	title: string;
	content: string;
	author: string;
	publishedAt: string;
	thumbnails: string[];
	generatedByAI: boolean;
}

interface BlogLayoutProps {
	posts: Post[];
}

export default function BlogLayout({ posts }: BlogLayoutProps) {
	return (
		<div className="min-h-screen bg-background selection:bg-primary/10">
			{/* Header with Cat Avatar */}
			<header className="flex flex-col items-center justify-center pt-16 pb-10 sm:pt-24 sm:pb-16 bg-gradient-to-b from-primary/5 to-transparent">
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5, type: "spring" }}
				>
					<CatAvatar />
				</motion.div>
				<div className="mt-6 sm:mt-8 text-center px-6">
					<h1 className="text-3xl sm:text-5xl font-black text-primary tracking-tight">
						Marlang
					</h1>
				</div>
			</header>

			{/* Posts Section */}
			<main className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
				{posts.length > 0 ? (
					<div className="grid grid-cols-1 gap-8 sm:gap-10">
						{posts.map((post) => (
							<PostCard key={post.id} {...post} />
						))}
					</div>
				) : (
					<div className="text-center py-24 bg-secondary/20 rounded-3xl border-2 border-dashed border-border mx-4">
						<p className="text-4xl sm:text-5xl mb-6">🧶</p>
						<p className="text-muted-foreground text-lg sm:text-xl font-medium">
							No posts yet. Marlang is still chasing yarn balls!
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
