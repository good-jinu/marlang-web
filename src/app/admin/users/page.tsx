"use client";

import { getAuth, type User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";

interface AdminUser {
	uid: string;
	email: string;
	createdAt: { toDate: () => Date }; // Firestore timestamp
	addedBy: string;
}

interface TargetUser {
	id: string;
	[key: string]: any;
}

export default function AdminUsersPage() {
	const [admins, setAdmins] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [newAdminEmail, setNewAdminEmail] = useState("");
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const fetchAdmins = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/admins", {
				headers: {
					Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch admins");
			}

			const data = await response.json();
			setAdmins(data.admins || []);
		} catch (err) {
			console.error("Error fetching admins:", err);
			setError("Failed to load admin users");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) {
				setCurrentUser(user);
				fetchAdmins();
			} else {
				// Redirect to login or show unauthorized message
				window.location.href = "/login";
			}
		});

		return () => unsubscribe();
	}, [fetchAdmins]);

	const addAdmin = async () => {
		if (!newAdminEmail) {
			setError("Please enter an email address");
			return;
		}

		try {
			setError(null);

			// First, find the user by email
			const usersSnapshot = await getDocs(collection(db, "users"));
			const targetUserDoc = usersSnapshot.docs.find(
				(doc) => doc.data().email === newAdminEmail,
			);

			if (!targetUserDoc) {
				setError("User not found with this email");
				return;
			}

			const targetUser: TargetUser = {
				id: targetUserDoc.id,
				...targetUserDoc.data(),
			};

			// Call the Cloud Function to set admin claim
			const response = await fetch("/api/set-admin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
				},
				body: JSON.stringify({
					uid: targetUser.id,
					email: newAdminEmail,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to add admin");
			}

			setSuccess("Admin added successfully!");
			setNewAdminEmail("");
			fetchAdmins(); // Refresh the list
		} catch (err) {
			console.error("Error adding admin:", err);
			setError("Failed to add admin");
		}
	};

	const removeAdmin = async (uid: string) => {
		try {
			setError(null);

			const response = await fetch("/api/remove-admin", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
				},
				body: JSON.stringify({ uid }),
			});

			if (!response.ok) {
				throw new Error("Failed to remove admin");
			}

			setSuccess("Admin removed successfully!");
			fetchAdmins(); // Refresh the list
		} catch (err) {
			console.error("Error removing admin:", err);
			setError("Failed to remove admin");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
				<p className="text-gray-500 text-sm">
					Add or remove admin privileges for users
				</p>
			</div>

			{/* Add Admin Section */}
			<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Add Admin</h2>

				<div className="flex gap-4">
					<input
						type="email"
						value={newAdminEmail}
						onChange={(e) => setNewAdminEmail(e.target.value)}
						placeholder="Enter user email"
						className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					/>
					<button
						type="button"
						onClick={addAdmin}
						className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
					>
						Add Admin
					</button>
				</div>

				<p className="text-xs text-gray-500 mt-2">
					Note: The user must already have an account in the system
				</p>
			</div>

			{/* Messages */}
			{error && (
				<div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
					{error}
				</div>
			)}

			{success && (
				<div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
					{success}
				</div>
			)}

			{/* Admins List */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-100">
					<h3 className="font-bold text-gray-900">Current Admins</h3>
				</div>

				{admins.length > 0 ? (
					<div className="divide-y divide-gray-100">
						{admins.map((admin) => (
							<div
								key={admin.uid}
								className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
							>
								<div>
									<p className="font-medium text-gray-900">{admin.email}</p>
									<p className="text-xs text-gray-500">
										Added:{" "}
										{admin.createdAt?.toDate?.()?.toLocaleDateString() ||
											"Unknown"}
									</p>
								</div>

								<button
									type="button"
									onClick={() => removeAdmin(admin.uid)}
									className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
									disabled={admin.uid === currentUser?.uid}
								>
									{admin.uid === currentUser?.uid ? "Current User" : "Remove"}
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="px-6 py-12 text-center text-gray-400 text-sm">
						No admins found.
					</div>
				)}
			</div>
		</div>
	);
}
