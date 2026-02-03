"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveCat() {
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [emotion, setEmotion] = useState("happy"); // 'happy', 'angry', 'neutral'
	const catRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		// biome-ignore lint/suspicious/noExplicitAny: event is any
		const handleMouseMove = (e: any) => {
			if (catRef.current) {
				const rect = catRef.current.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 2;

				setMousePos({
					x: e.clientX - centerX,
					y: e.clientY - centerY,
				});
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	// Automatically change expression
	useEffect(() => {
		const interval = setInterval(() => {
			const emotions = ["happy", "angry", "neutral"];
			setEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
		}, 3000);

		return () => clearInterval(interval);
	}, []);

	// Calculate pupil position
	const calculatePupilPosition = (maxDistance = 8) => {
		const distance = Math.sqrt(mousePos.x ** 2 + mousePos.y ** 2);
		const angle = Math.atan2(mousePos.y, mousePos.x);
		const limitedDistance = Math.min(distance / 20, maxDistance);

		return {
			x: Math.cos(angle) * limitedDistance,
			y: Math.sin(angle) * limitedDistance,
		};
	};

	const pupilPos = calculatePupilPosition();

	// Eye shape based on emotion
	const getEyeShape = () => {
		switch (emotion) {
			case "angry":
				return {
					eyeHeight: 20,
					eyebrowAngle: -15,
					mouthCurve: "M 150 200 Q 180 210 210 200",
				};
			case "happy":
				return {
					eyeHeight: 35,
					eyebrowAngle: 5,
					mouthCurve: "M 150 200 Q 180 190 210 200",
				};
			default:
				return {
					eyeHeight: 30,
					eyebrowAngle: 0,
					mouthCurve: "M 150 200 L 210 200",
				};
		}
	};

	const eyeShape = getEyeShape();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">
					Interactive Cat 🐱
				</h1>
				<p className="text-gray-600">
					Move your mouse! Expression:{" "}
					<span className="font-semibold">{emotion}</span>
				</p>
			</div>

			<svg
				ref={catRef}
				width="400"
				height="400"
				viewBox="0 0 400 400"
				className="drop-shadow-2xl"
			>
				<title>cat</title>
				{/* Background circle */}
				<circle cx="200" cy="200" r="180" fill="#F0F0F0" />

				{/* Left ear */}
				<path
					d="M 100 120 L 80 40 L 140 100 Z"
					fill="white"
					stroke="black"
					strokeWidth="3"
					style={{ transition: "all 0.3s ease" }}
				/>
				<path d="M 95 100 L 85 60 L 120 95 Z" fill="#FFC0CB" />

				{/* Right ear */}
				<path
					d="M 300 120 L 320 40 L 260 100 Z"
					fill="white"
					stroke="black"
					strokeWidth="3"
					style={{ transition: "all 0.3s ease" }}
				/>
				<path d="M 305 100 L 315 60 L 280 95 Z" fill="#FFC0CB" />

				{/* Face */}
				<circle cx="200" cy="200" r="120" fill="white" />

				{/* Left eyebrow */}
				<line
					x1="140"
					y1="160"
					x2="180"
					y2={160 + eyeShape.eyebrowAngle}
					stroke="black"
					strokeWidth="4"
					strokeLinecap="round"
					style={{ transition: "all 0.5s ease" }}
				/>

				{/* Right eyebrow */}
				<line
					x1="260"
					y1="160"
					x2="220"
					y2={160 + eyeShape.eyebrowAngle}
					stroke="black"
					strokeWidth="4"
					strokeLinecap="round"
					style={{ transition: "all 0.5s ease" }}
				/>

				{/* Left eye */}
				<ellipse
					cx="160"
					cy="180"
					rx="25"
					ry={eyeShape.eyeHeight}
					fill="#FFD700"
					stroke="#333"
					strokeWidth="2"
					style={{ transition: "all 0.5s ease" }}
				/>
				<circle
					cx={160 + pupilPos.x}
					cy={180 + pupilPos.y}
					r="12"
					fill="#000"
					style={{ transition: "all 0.1s ease-out" }}
				/>
				<circle
					cx={163 + pupilPos.x}
					cy={177 + pupilPos.y}
					r="4"
					fill="white"
				/>

				{/* Right eye */}
				<ellipse
					cx="240"
					cy="180"
					rx="25"
					ry={eyeShape.eyeHeight}
					fill="#FFD700"
					stroke="#333"
					strokeWidth="2"
					style={{ transition: "all 0.5s ease" }}
				/>
				<circle
					cx={240 + pupilPos.x}
					cy={180 + pupilPos.y}
					r="12"
					fill="#000"
					style={{ transition: "all 0.1s ease-out" }}
				/>
				<circle
					cx={243 + pupilPos.x}
					cy={177 + pupilPos.y}
					r="4"
					fill="white"
				/>

				{/* Nose */}
				<path d="M 200 200 L 190 215 L 210 215 Z" fill="#FFC0CB" />

				{/* Mouth */}
				<path
					d={eyeShape.mouthCurve}
					stroke="#333"
					strokeWidth="3"
					fill="none"
					strokeLinecap="round"
					style={{ transition: "all 0.5s ease" }}
				/>

				{/* Whiskers - left */}
				<line
					x1="80"
					y1="190"
					x2="140"
					y2="195"
					stroke="#333"
					strokeWidth="2"
				/>
				<line
					x1="80"
					y1="210"
					x2="140"
					y2="210"
					stroke="#333"
					strokeWidth="2"
				/>
				<line
					x1="80"
					y1="230"
					x2="140"
					y2="225"
					stroke="#333"
					strokeWidth="2"
				/>

				{/* Whiskers - right */}
				<line
					x1="320"
					y1="190"
					x2="260"
					y2="195"
					stroke="#333"
					strokeWidth="2"
				/>
				<line
					x1="320"
					y1="210"
					x2="260"
					y2="210"
					stroke="#333"
					strokeWidth="2"
				/>
				<line
					x1="320"
					y1="230"
					x2="260"
					y2="225"
					stroke="#333"
					strokeWidth="2"
				/>
			</svg>
		</div>
	);
}
