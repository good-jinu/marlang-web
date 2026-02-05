"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
	const { loginWithGoogle, user, isAdmin, loading } = useAuth();
	const router = useRouter();
	const [error, setError] = useState("");

	useEffect(() => {
		if (!loading && user) {
			if (isAdmin) {
				router.push("/admin");
			} else {
				setError("Your account is not authorized to access the admin panel.");
			}
		}
	}, [user, isAdmin, loading, router]);

	const handleLogin = async () => {
		try {
			setError("");
			await loginWithGoogle();
		} catch (_err) {
			setError("Failed to log in. Please try again.");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-slate-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8"
			>
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">AI Cat Blog</h1>
					<p className="text-gray-600">Admin Authentication</p>
				</div>

				{error && (
					<div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
						{error}
					</div>
				)}

				<button
					type="button"
					onClick={handleLogin}
					className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
				>
					<Image
						src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
						alt="Google"
						width={20}
						height={20}
						sizes="(max-width: 768px) 100vw, 20px"
						className="w-5 h-5"
					/>
					Sign in with Google
				</button>

				<p className="text-center text-xs text-gray-500">
					Only authorized administrators can access this area.
				</p>
			</motion.div>
		</div>
	);
}
