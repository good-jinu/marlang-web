import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/config";

async function getPost(id: string) {
	// Direct ID lookup
	const docRef = doc(db, "posts", id);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) {
		notFound();
	}

	return docSnap.data();
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const post = await getPost(id);
	const thumbnails =
		post.thumbnails || (post.thumbnail ? [post.thumbnail] : []);

	return (
		<main className="min-h-screen bg-background">
			<section className="max-w-4xl mx-auto px-4 py-16">
				{thumbnails.length > 0 && (
					<div className="mb-10 space-y-6">
						{thumbnails.map((thumb: string, index: number) => (
							<div
								key={thumb}
								className="relative aspect-video rounded-2xl overflow-hidden border border-border shadow-lg"
							>
								<Image
									src={thumb}
									alt={`Post image ${index + 1}`}
									fill
									className="object-cover"
									priority={index === 0}
									sizes="(max-width: 896px) 100vw, 896px"
								/>
							</div>
						))}
					</div>
				)}
				<h1 className="text-4xl font-black text-card-foreground mb-8">
					{post.title}
				</h1>
				<div className="prose lg:prose-xl max-w-none text-card-foreground leading-relaxed whitespace-pre-wrap">
					{post.content}
				</div>
			</section>
		</main>
	);
}
