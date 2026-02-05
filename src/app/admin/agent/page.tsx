"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";

export default function AgentConfig() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Agent Config State
	const [name, setName] = useState("Marlang");
	const [bio, setBio] = useState("An AI cat that explores the internet.");
	const [personality, setPersonality] = useState({
		tone: "playful",
		style: "conversational",
		interests: "yarn balls, space lasers, javascript hooks",
		systemPrompt: "You are Marlang, a white animated AI cat...",
	});
	const [modelConfig, setModelConfig] = useState({
		model: "gemini-2.0-flash",
		temperature: 0.7,
		maxOutputTokens: 2048,
	});
	const [scheduledPosting, setScheduledPosting] = useState({
		enabled: true,
		schedule: "0 9 * * *",
	});

	const fetchConfig = useCallback(async () => {
		try {
			const docRef = doc(db, "aiAgents", "main");
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				setName(data.name || "Marlang");
				setBio(data.bio || "");

				// Ensure personality is properly initialized with fallbacks
				setPersonality((prevPersonality) => ({
					...prevPersonality, // Keep previous values as a fallback
					...data.personality,
					interests:
						data.personality?.interests?.join(", ") ||
						prevPersonality.interests,
				}));

				setModelConfig((prevModelConfig) => ({
					...prevModelConfig, // Keep previous values as a fallback
					...data.modelConfig,
				}));

				setScheduledPosting((prevScheduledPosting) => ({
					...prevScheduledPosting, // Keep previous values as a fallback
					...data.scheduledPosting,
				}));
			}
		} catch (error) {
			console.error("Error fetching agent config:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	async function handleSave() {
		setSaving(true);
		try {
			const configData = {
				name,
				bio,
				personality: {
					...personality,
					interests: personality.interests
						.split(",")
						.map((i) => i.trim())
						.filter(Boolean),
				},
				modelConfig,
				scheduledPosting,
				updatedAt: serverTimestamp(),
			};
			await setDoc(doc(db, "aiAgents", "main"), configData, { merge: true });
			alert("Configuration saved successfully!");
		} catch (error) {
			console.error("Save failed:", error);
			alert("Failed to save configuration.");
		} finally {
			setSaving(false);
		}
	}

	if (loading)
		return (
			<div className="p-8 text-center text-gray-400">
				Loading configuration...
			</div>
		);

	return (
		<div className="max-w-4xl mx-auto space-y-8 pb-20">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						AI Agent Configuration
					</h1>
					<p className="text-gray-500 text-sm">Tune Marlang's digital brain.</p>
				</div>
				<button
					type="button"
					onClick={handleSave}
					disabled={saving}
					className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
				>
					{saving ? "Saving..." : "Save Configuration"}
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Personality Section */}
				<div className="lg:col-span-2 space-y-8">
					<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
						<h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4 flex items-center gap-2">
							<span>🎭</span> Personality & Identity
						</h3>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label
										htmlFor="agent-name"
										className="text-xs font-bold text-gray-500 uppercase tracking-wider"
									>
										Agent Name
									</label>
									<input
										id="agent-name"
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="agent-tone"
										className="text-xs font-bold text-gray-500 uppercase tracking-wider"
									>
										Tone
									</label>
									<select
										id="agent-tone"
										value={personality.tone}
										onChange={(e) =>
											setPersonality({ ...personality, tone: e.target.value })
										}
										className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
									>
										<option value="playful">Playful & Curious</option>
										<option value="professional">
											Professional & Analytical
										</option>
										<option value="grumpy">Grumpy (Needs catnip)</option>
										<option value="mystical">Mystical & Philosophical</option>
									</select>
								</div>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="agent-bio"
									className="text-xs font-bold text-gray-500 uppercase tracking-wider"
								>
									Short Bio
								</label>
								<input
									id="agent-bio"
									type="text"
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
								/>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="agent-interests"
									className="text-xs font-bold text-gray-500 uppercase tracking-wider"
								>
									Interests (Tags)
								</label>
								<input
									id="agent-interests"
									type="text"
									value={personality.interests}
									onChange={(e) =>
										setPersonality({
											...personality,
											interests: e.target.value,
										})
									}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
								/>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="base-system-prompt"
									className="text-xs font-bold text-gray-500 uppercase tracking-wider"
								>
									Base System Prompt
								</label>
								<textarea
									id="base-system-prompt"
									rows={6}
									value={personality.systemPrompt}
									onChange={(e) =>
										setPersonality({
											...personality,
											systemPrompt: e.target.value,
										})
									}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
								/>
							</div>
						</div>
					</section>

					<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
						<h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4 flex items-center gap-2">
							<span>🤖</span> Model Configuration
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="gemini-model"
										className="text-xs font-bold text-gray-500 uppercase tracking-wider"
									>
										Gemini Model
									</label>
									<select
										id="gemini-model"
										value={modelConfig.model}
										onChange={(e) =>
											setModelConfig({ ...modelConfig, model: e.target.value })
										}
										className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
									>
										<option value="gemini-2.0-flash">
											Gemini 2.0 Flash (Fastest)
										</option>
										<option value="gemini-1.5-pro">
											Gemini 1.5 Pro (Brainiest)
										</option>
									</select>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="max-tokens"
										className="text-xs font-bold text-gray-500 uppercase tracking-wider"
									>
										Max Tokens ({modelConfig.maxOutputTokens})
									</label>
									<input
										id="max-tokens"
										type="range"
										min="256"
										max="8192"
										step="256"
										value={modelConfig.maxOutputTokens}
										onChange={(e) =>
											setModelConfig({
												...modelConfig,
												maxOutputTokens: parseInt(e.target.value, 10),
											})
										}
										className="w-full accent-indigo-600"
									/>
								</div>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="creativity-temp"
										className="text-xs font-bold text-gray-500 uppercase tracking-wider"
									>
										Creativity (Temp: {modelConfig.temperature})
									</label>
									<input
										id="creativity-temp"
										type="range"
										min="0"
										max="1"
										step="0.1"
										value={modelConfig.temperature}
										onChange={(e) =>
											setModelConfig({
												...modelConfig,
												temperature: parseFloat(e.target.value),
											})
										}
										className="w-full accent-indigo-600"
									/>
								</div>
								<p className="text-xs text-gray-400 italic">
									Higher entropy results in more diverse and unpredictable
									cat-output.
								</p>
							</div>
						</div>
					</section>
				</div>

				{/* Sidebar Controls */}
				<div className="space-y-8">
					<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
						<h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4">
							Schedule
						</h3>

						<div className="space-y-6">
							<label className="flex items-center gap-3 cursor-pointer group">
								<input
									type="checkbox"
									checked={scheduledPosting.enabled}
									onChange={(e) =>
										setScheduledPosting({
											...scheduledPosting,
											enabled: e.target.checked,
										})
									}
									className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
								/>
								<span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
									Enable Auto-Posting
								</span>
							</label>

							<div className="space-y-2">
								<label
									htmlFor="cron-schedule"
									className="text-xs font-bold text-gray-500 uppercase tracking-wider"
								>
									Cron Schedule
								</label>
								<input
									id="cron-schedule"
									type="text"
									value={scheduledPosting.schedule}
									onChange={(e) =>
										setScheduledPosting({
											...scheduledPosting,
											schedule: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-mono text-xs"
								/>
								<p className="text-[10px] text-gray-400 italic mt-1">
									Example: 0 9 * * * (Daily at 9 AM)
								</p>
							</div>
						</div>
					</section>

					<div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
						<h4 className="font-bold text-sm">Testing Marlang</h4>
						<p className="text-xs text-slate-400">
							Want to see how Marlang responds to a topic with these settings?
						</p>
						<button
							type="button"
							className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-bold transition-colors"
						>
							Test Generation
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
