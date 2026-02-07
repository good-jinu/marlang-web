"use client";

import {
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
	signOut,
	type User,
} from "firebase/auth";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/config";

interface AuthContextType {
	user: User | null;
	isAdmin: boolean;
	loading: boolean;
	loginWithGoogle: () => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user);
			if (user) {
				// Get the ID token to check for admin claims
				const idTokenResult = await user.getIdTokenResult();
				setIsAdmin(idTokenResult.claims.admin === true);
			} else {
				setIsAdmin(false);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		try {
			await signInWithPopup(auth, provider);
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error("Logout failed:", error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{ user, isAdmin, loading, loginWithGoogle, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
