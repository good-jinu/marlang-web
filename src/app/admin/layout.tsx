"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isAdmin, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push("/login");
			} else if (!isAdmin) {
				router.push("/login");
			}
		}
	}, [user, isAdmin, loading, router]);

	if (loading || !user || !isAdmin) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-slate-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Basic Admin Header */}
			<header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-600">{user.email}</span>
					<button
						type="button"
						onClick={() => router.push("/login")} // Logout logic is in AuthContext, but router.push triggers effect
						className="text-sm text-red-600 hover:text-red-700 font-medium"
					>
						Sign Out
					</button>
				</div>
			</header>

			{/* Admin Content */}
			<main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
		</div>
	);
}
