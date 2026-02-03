import InteractiveCat from "@/components/InteractiveCat";

export default function Home() {
	return (
		<div className="flex min-h-screen items-stretch justify-center">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center">
				<InteractiveCat />
			</main>
		</div>
	);
}
