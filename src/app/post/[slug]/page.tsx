import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/config";

async function getPost(slug: string) {
	// 1. Try direct ID lookup (Optimized for new posts)
	const docRef = doc(db, "posts", slug);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		return docSnap.data();
	}

	// 2. Fallback to query (Compatibility for old posts)
	const q = query(collection(db, "posts"), where("slug", "==", slug));
	const querySnapshot = await getDocs(q);

	if (querySnapshot.empty) {
		notFound();
	}

	return querySnapshot.docs[0].data();
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPost(slug);

	return (
		<main className="min-h-screen bg-white">
			<section className="max-w-4xl mx-auto px-4 py-16">
				<h1 className="text-4xl font-bold mb-4">{post.title}</h1>
				<div className="prose lg:prose-xl max-w-none">{post.content}</div>
			</section>
		</main>
	);
}
