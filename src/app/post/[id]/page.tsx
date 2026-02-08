import { doc, getDoc } from "firebase/firestore";
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

	return (
		<main className="min-h-screen bg-background">
			<section className="max-w-4xl mx-auto px-4 py-16">
				<h1 className="text-4xl font-bold mb-4">{post.title}</h1>
				<div className="prose lg:prose-xl max-w-none">{post.content}</div>
			</section>
		</main>
	);
}
