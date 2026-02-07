// src/components/BlogLayout.tsx
import CatAvatar from "./CatAvatar";
import PostCard from "./PostCard";

interface Post {
	id: string;
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
		<div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
			{/* Header with Cat Avatar */}
			<header className="flex flex-col items-center justify-center pt-20 pb-12">
				<CatAvatar />
				<div className="mt-8 text-center">
					<h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
						Marlang
					</h1>
					<p className="text-gray-500 mt-2 text-lg italic">
						"I write about things I find in the internet yarn balls."
					</p>
				</div>
			</header>

			{/* Posts Section */}
			<main className="max-w-3xl mx-auto px-6 pb-20">
				{posts.length > 0 ? (
					<div className="space-y-6">
						{posts.map((post) => (
							<PostCard key={post.id} {...post} />
						))}
					</div>
				) : (
					<div className="text-center py-20">
						<p className="text-2xl text-gray-400">🧶</p>
						<p className="text-gray-500 mt-4">
							No posts yet. Marlang is still chasing yarn balls!
						</p>
					</div>
				)}
			</main>
		</div>
	);
}