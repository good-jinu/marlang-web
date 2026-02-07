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

export default function CatAvatar() {
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
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	const getEyePath = (emotion: Emotion, side: "left" | "right") => {
		const isLeft = side === "left";
		switch (emotion) {
			case "happy":
				return isLeft ? "M 35 45 Q 40 40 45 45" : "M 65 45 Q 70 40 75 45";
			case "sleepy":
				return isLeft ? "M 35 45 Q 40 48 45 45" : "M 65 45 Q 70 48 75 45";
			case "surprised":
				return "M 40 45 A 5 5 0 1 1 40 44.9";
			default:
				return "M 40 45 A 3 3 0 1 1 40 44.9";
		}
	};

	const getMouthPath = (emotion: Emotion) => {
		switch (emotion) {
			case "happy":
				return "M 45 65 Q 50 70 55 65";
			case "excited":
				return "M 42 65 Q 50 75 58 65";
			case "thoughtful":
				return "M 45 68 L 55 68";
			default:
				return "M 45 65 Q 50 68 55 65";
		}
	};

	return (
		<motion.div
			layout
			className="relative w-64 h-64 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-2xl"
			whileHover={{ scale: 1.05 }}
			onClick={() => {
				const nextIndex = (emotions.indexOf(emotion) + 1) % emotions.length;
				setEmotion(emotions[nextIndex]);
			}}
		>
			<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
				<title>Marlang the AI Cat</title>
				<motion.circle
					cx="50"
					cy="50"
					r="45"
					fill="white"
					stroke="#e2e8f0"
					strokeWidth="2"
				/>

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

				<motion.path d="M 48 58 L 52 58 L 50 62 Z" fill="#f6ad55" />

				<AnimatePresence initial={false} mode="wait">
					{emotion === "surprised" ? (
						<motion.circle
							key="mouth-surprised"
							cx="50"
							cy="68"
							r="3"
							fill="#2d3748"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							transition={{ duration: 0.2 }}
						/>
					) : (
						<motion.path
							key="mouth-normal"
							initial={{ opacity: 0, pathLength: 0 }}
							animate={{
								opacity: 1,
								pathLength: 1,
								d: getMouthPath(emotion),
							}}
							exit={{ opacity: 0, pathLength: 0 }}
							fill="none"
							stroke="#2d3748"
							strokeWidth="2"
							strokeLinecap="round"
							transition={{ duration: 0.3 }}
						/>
					)}
				</AnimatePresence>

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

			<AnimatePresence mode="wait">
				<motion.div
					key={emotion}
					initial={{ opacity: 0, scale: 0.8, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: -10 }}
					className="absolute -top-4 right-0 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-lg"
				>
					{emotion}
				</motion.div>
			</AnimatePresence>
		</motion.div>
	);
}
