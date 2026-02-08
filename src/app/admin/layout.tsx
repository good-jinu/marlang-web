"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isAdmin, loading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

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
			<div className="flex items-center justify-center min-h-screen bg-muted">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	const navLinks = [
		{ name: "Dashboard", href: "/admin" },
		{ name: "Posts", href: "/admin/posts" },
		{ name: "AI Agent", href: "/admin/agent" },
		{ name: "Users", href: "/admin/users" },
	];

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Basic Admin Header */}
			<header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
					<nav className="hidden md:flex items-center gap-1 ml-8">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
										? "bg-indigo-100 text-indigo-700"
										: "text-gray-600 hover:bg-gray-100"
									}`}
							>
								{link.name}
							</Link>
						))}
					</nav>
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

			{/* Mobile Navigation */}
			<div className="md:hidden bg-white border-b border-gray-200 px-6 py-2 overflow-x-auto">
				<nav className="flex gap-1">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
									? "bg-indigo-100 text-indigo-700"
									: "text-gray-600 hover:bg-gray-100"
								}`}
						>
							{link.name}
						</Link>
					))}
				</nav>
			</div>

			{/* Admin Content */}
			<main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
		</div>
	);
}
