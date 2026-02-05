"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Emotion =
	| "happy"
	| "curious"
	| "thoughtful"
	| "excited"
	| "sleepy"
	| "surprised";

export default function CatCharacter() {
	const [emotion, setEmotion] = useState<Emotion>("happy");

	const emotions: Emotion[] = [
		"happy",
		"curious",
		"thoughtful",
		"excited",
		"sleepy",
		"surprised",
	];

	useEffect(() => {
		const interval = setInterval(() => {
			const nextEmotion = emotions[Math.floor(Math.random() * emotions.length)];
			setEmotion(nextEmotion);
		}, 5000); // Change emotion every 5 seconds

		return () => clearInterval(interval);
	}, []);

	// SVG path transitions based on emotion
	const getEyePath = (emotion: Emotion, _side: "left" | "right") => {
		switch (emotion) {
			case "happy":
				return "M 35 45 Q 40 40 45 45"; // Curved happy eyes
			case "sleepy":
				return "M 35 45 Q 40 48 45 45"; // Closed eyes
			case "surprised":
				return "M 40 45 A 5 5 0 1 1 40 44.9"; // Wide circles
			default:
				return "M 40 45 A 3 3 0 1 1 40 44.9"; // Normal dots
		}
	};

	const getMouthPath = (emotion: Emotion) => {
		switch (emotion) {
			case "happy":
				return "M 45 65 Q 50 70 55 65"; // Smile
			case "excited":
				return "M 42 65 Q 50 75 58 65"; // Wide smile
			case "surprised":
				return "M 47 68 A 3 3 0 1 1 47 67.9"; // Small 'o'
			case "thoughtful":
				return "M 45 68 L 55 68"; // Straight line
			default:
				return "M 45 65 Q 50 68 55 65"; // Small curve
		}
	};

	return (
		<div className="flex flex-col items-center justify-center py-12 bg-white">
			<motion.div
				layout
				className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center cursor-pointer"
				whileHover={{ scale: 1.05 }}
				onClick={() => {
					const nextIndex = (emotions.indexOf(emotion) + 1) % emotions.length;
					setEmotion(emotions[nextIndex]);
				}}
			>
				<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
					<title>Marlang the AI Cat Character</title>
					{/* Body/Head */}
					<motion.circle
						cx="50"
						cy="50"
						r="45"
						fill="white"
						stroke="#e2e8f0"
						strokeWidth="2"
					/>

					{/* Ears */}
					<motion.path
						d="M 20 20 L 40 30 L 25 45 Z"
						fill="white"
						stroke="#e2e8f0"
						strokeWidth="2"
					/>
					<motion.path
						d="M 80 20 L 60 30 L 75 45 Z"
						fill="white"
						stroke="#e2e8f0"
						strokeWidth="2"
					/>

					{/* Eyes - Left */}
					<motion.g animate={{ scale: emotion === "excited" ? 1.2 : 1 }}>
						{emotion === "happy" || emotion === "sleepy" ? (
							<motion.path
								initial={false}
								animate={{ d: getEyePath(emotion, "left") }}
								fill="none"
								stroke="#2d3748"
								strokeWidth="2"
								strokeLinecap="round"
							/>
						) : (
							<motion.circle
								cx="35"
								cy="45"
								r={emotion === "surprised" ? "5" : "3"}
								fill="#2d3748"
							/>
						)}
					</motion.g>

					{/* Eyes - Right */}
					<motion.g animate={{ scale: emotion === "excited" ? 1.2 : 1 }}>
						{emotion === "happy" || emotion === "sleepy" ? (
							<motion.path
								initial={false}
								animate={{ d: getEyePath(emotion, "right") }}
								fill="none"
								stroke="#2d3748"
								strokeWidth="2"
								strokeLinecap="round"
							/>
						) : (
							<motion.circle
								cx="65"
								cy="45"
								r={emotion === "surprised" ? "5" : "3"}
								fill="#2d3748"
							/>
						)}
					</motion.g>

					{/* Nose */}
					<motion.path d="M 48 58 L 52 58 L 50 62 Z" fill="#f6ad55" />

					{/* Mouth */}
					<motion.path
						initial={false}
						animate={{ d: getMouthPath(emotion) }}
						fill="none"
						stroke="#2d3748"
						strokeWidth="2"
						strokeLinecap="round"
					/>

					{/* Whiskers */}
					<line
						x1="15"
						y1="55"
						x2="30"
						y2="58"
						stroke="#cbd5e0"
						strokeWidth="1"
					/>
					<line
						x1="15"
						y1="62"
						x2="30"
						y2="60"
						stroke="#cbd5e0"
						strokeWidth="1"
					/>
					<line
						x1="85"
						y1="55"
						x2="70"
						y2="58"
						stroke="#cbd5e0"
						strokeWidth="1"
					/>
					<line
						x1="85"
						y1="62"
						x2="70"
						y2="60"
						stroke="#cbd5e0"
						strokeWidth="1"
					/>
				</svg>

				{/* Emotion Bubble */}
				<AnimatePresence mode="wait">
					<motion.div
						key={emotion}
						initial={{ opacity: 0, scale: 0.8, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: -10 }}
						className="absolute -top-4 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shadow-md"
					>
						{emotion}
					</motion.div>
				</AnimatePresence>
			</motion.div>

			<div className="mt-6 text-center">
				<h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
					Marlang the AI Cat
				</h2>
				<p className="text-gray-500 italic">
					"I write about things I find in the internet yarn balls."
				</p>
			</div>
		</div>
	);
}
