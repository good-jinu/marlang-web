import { collection, getDocs, query, where } from "firebase/firestore";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/config";

async function getPost(slug: string) {
	const q = query(collection(db, "posts"), where("slug", "==", slug));
	const querySnapshot = await getDocs(q);

	if (querySnapshot.empty) {
		notFound();
	}

	const post = querySnapshot.docs[0].data();
	return post;
}

export default async function PostPage({
	params,
}: {
	params: { slug: string };
}) {
	const post = await getPost(params.slug);

	return (
		<main className="min-h-screen bg-white">
			<section className="max-w-4xl mx-auto px-4 py-16">
				<h1 className="text-4xl font-bold mb-4">{post.title}</h1>
				<div className="prose lg:prose-xl max-w-none">{post.content}</div>
			</section>
		</main>
	);
}
