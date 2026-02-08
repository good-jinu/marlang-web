// src/components/BlogLayout.tsx
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
		<div className="min-h-screen bg-background">
			{/* Header with Cat Avatar */}
			<header className="flex flex-col items-center justify-center pt-20 pb-12">
				<CatAvatar />
				<div className="mt-8 text-center">
					<h1 className="text-4xl font-black text-primary">
						Marlang
					</h1>
					<p className="text-muted-foreground mt-2 text-lg italic">
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
						<p className="text-2xl text-muted-foreground">🧶</p>
						<p className="text-muted-foreground mt-4">
							No posts yet. Marlang is still chasing yarn balls!
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
