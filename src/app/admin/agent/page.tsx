"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
	Bot,
	CheckCircle2,
	Clock,
	Loader2,
	Save,
	Wand2,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";

export default function AgentConfig() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState(false);

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
	const [thumbnailGenConfig, setThumbnailGenConfig] = useState({
		enabled: true,
		style: "Cinematic, high-quality, cat-themed",
		count: 3,
		promptTemplate:
			"Generate a beautiful image of {agent_name} {activity} in {style} style.",
	});

	const fetchConfig = useCallback(async () => {
		try {
			const docRef = doc(db, "aiAgents", "main");
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				setName(data.name || "Marlang");
				setBio(data.bio || "");

				setPersonality((prev) => ({
					...prev,
					...data.personality,
					interests: Array.isArray(data.personality?.interests)
						? data.personality.interests.join(", ")
						: prev.interests,
				}));

				setModelConfig((prev) => ({
					...prev,
					...data.modelConfig,
				}));

				setScheduledPosting((prev) => ({
					...prev,
					...data.scheduledPosting,
				}));

				if (data.thumbnailGenConfig) {
					setThumbnailGenConfig((prev) => ({
						...prev,
						...data.thumbnailGenConfig,
					}));
				}
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
		setSuccess(false);
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
				thumbnailGenConfig,
				updatedAt: serverTimestamp(),
			};
			await setDoc(doc(db, "aiAgents", "main"), configData, { merge: true });
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error("Save failed:", error);
			alert("Failed to save configuration.");
		} finally {
			setSaving(false);
		}
	}

	if (loading)
		return (
			<div className="flex flex-col items-center justify-center p-20 text-gray-400">
				<Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
				<p className="text-sm font-medium">Tuning digital brain...</p>
			</div>
		);

	return (
		<div className="max-w-5xl mx-auto space-y-10 pb-20">
			<div className="flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-10 border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
				<div>
					<h1 className="text-2xl font-black text-gray-900 tracking-tight">
						Agent Configuration
					</h1>
					<p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1 italic">
						Core Intelligence & Persona
					</p>
				</div>
				<button
					type="button"
					onClick={handleSave}
					disabled={saving}
					className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-xl ${
						success
							? "bg-emerald-500 text-white shadow-emerald-100"
							: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
					} disabled:opacity-50`}
				>
					{saving ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : success ? (
						<CheckCircle2 className="w-5 h-5" />
					) : (
						<Save className="w-5 h-5" />
					)}
					<span>
						{saving ? "Saving..." : success ? "Saved!" : "Save Configuration"}
					</span>
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<div className="lg:col-span-8 space-y-8">
					{/* Personality Section */}
					<section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8 relative overflow-hidden">
						<div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
							<Bot size={120} strokeWidth={1} />
						</div>

						<h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-3">
							<span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
								<Bot size={20} />
							</span>
							Personality & Identity
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-2">
								<label
									htmlFor="agent-name"
									className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
								>
									Agent Name
								</label>
								<input
									id="agent-name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all bg-gray-50/50 text-sm font-bold text-gray-800"
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="tone-of-voice"
									className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
								>
									Tone of Voice
								</label>
								<select
									id="tone-of-voice"
									value={personality.tone}
									onChange={(e) =>
										setPersonality({ ...personality, tone: e.target.value })
									}
									className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:bg-white focus:border-indigo-500 outline-none transition-all bg-gray-50/50 text-sm font-bold text-gray-800"
								>
									<option value="playful">Playful & Curious</option>
									<option value="professional">
										Professional & Analytical
									</option>
									<option value="mystical">Mystical & Philosophical</option>
									<option value="minimalist">Minimalist & Direct</option>
								</select>
							</div>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="agent-bio"
								className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
							>
								Short Biography
							</label>
							<input
								id="agent-bio"
								type="text"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:bg-white focus:border-indigo-500 outline-none transition-all bg-gray-50/50 text-sm font-medium text-gray-600"
								placeholder="A brief description of who this agent is..."
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="core-interests"
								className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
							>
								Core Interests (Keywords)
							</label>
							<input
								id="core-interests"
								type="text"
								value={personality.interests}
								onChange={(e) =>
									setPersonality({ ...personality, interests: e.target.value })
								}
								className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:bg-white focus:border-indigo-500 outline-none transition-all bg-gray-50/50 text-sm font-medium text-gray-600"
								placeholder="space, catnip, web dev, tuna..."
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="system-prompt"
								className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
							>
								System Prompt (The "Core Instruction集")
							</label>
							<textarea
								id="system-prompt"
								rows={8}
								value={personality.systemPrompt}
								onChange={(e) =>
									setPersonality({
										...personality,
										systemPrompt: e.target.value,
									})
								}
								className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:bg-white focus:border-indigo-500 outline-none transition-all bg-gray-50/50 text-sm font-mono leading-relaxed text-gray-600 resize-none"
							/>
						</div>
					</section>

					{/* Thumbnail Generation Section */}
					<section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8 relative overflow-hidden">
						<div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
							<Wand2 size={120} strokeWidth={1} />
						</div>

						<div className="flex items-center justify-between border-b border-gray-50 pb-6">
							<h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-3">
								<span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
									<Wand2 size={20} />
								</span>
								Visual Inspiration
							</h3>
							<label className="flex items-center gap-2 cursor-pointer group">
								<div
									className={`w-10 h-6 rounded-full p-1 transition-all ${thumbnailGenConfig.enabled ? "bg-emerald-500" : "bg-gray-200"}`}
								>
									<div
										className={`w-4 h-4 bg-white rounded-full transition-all transform ${thumbnailGenConfig.enabled ? "translate-x-4" : "translate-x-0"}`}
									/>
								</div>
								<input
									type="checkbox"
									className="hidden"
									checked={thumbnailGenConfig.enabled}
									onChange={(e) =>
										setThumbnailGenConfig({
											...thumbnailGenConfig,
											enabled: e.target.checked,
										})
									}
								/>
								<span className="text-xs font-black text-gray-400 uppercase tracking-widest">
									Auto-Visuals
								</span>
							</label>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-2">
								<label
									htmlFor="visual-style"
									className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
								>
									Visual Style
								</label>
								<input
									id="visual-style"
									type="text"
									value={thumbnailGenConfig.style}
									onChange={(e) =>
										setThumbnailGenConfig({
											...thumbnailGenConfig,
											style: e.target.value,
										})
									}
									className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:bg-white focus:border-indigo-500 outline-none transition-all bg-gray-50/50 text-sm font-bold text-gray-800"
									placeholder="e.g. Dreamy watercolor, Hyper-realistic, 3D Render..."
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="images-per-post"
									className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
								>
									Images per post
								</label>
								<div className="flex items-center gap-4">
									<input
										id="images-per-post"
										type="range"
										min="1"
										max="10"
										value={thumbnailGenConfig.count}
										onChange={(e) =>
											setThumbnailGenConfig({
												...thumbnailGenConfig,
												count: parseInt(e.target.value, 10),
											})
										}
										className="flex-1 accent-emerald-500"
									/>
									<span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-10 text-center">
										{thumbnailGenConfig.count}
									</span>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="visual-prompt-template"
								className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
							>
								Visual Prompt Template
							</label>
							<textarea
								id="visual-prompt-template"
								rows={4}
								value={thumbnailGenConfig.promptTemplate}
								onChange={(e) =>
									setThumbnailGenConfig({
										...thumbnailGenConfig,
										promptTemplate: e.target.value,
									})
								}
								className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:bg-white focus:border-indigo-500 outline-none transition-all bg-gray-50/50 text-sm font-medium text-gray-600 resize-none leading-relaxed"
								placeholder="How should the agent describe images to generate?"
							/>
							<p className="text-[10px] text-gray-400 italic">
								Available variables: {"{agent_name}"}, {"{activity}"},{" "}
								{"{style}"}, {"{topic}"}
							</p>
						</div>
					</section>
				</div>

				<div className="lg:col-span-4 space-y-8">
					{/* Model Config Section */}
					<section className="bg-slate-900 rounded-3xl shadow-2xl p-8 text-white space-y-8 overflow-hidden relative">
						<div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
							<Zap size={100} fill="white" />
						</div>

						<h3 className="font-extrabold text-lg flex items-center gap-3">
							<span className="p-2 bg-slate-800 text-amber-400 rounded-xl">
								<Zap size={20} />
							</span>
							Engine Settings
						</h3>

						<div className="space-y-6">
							<div className="space-y-2">
								<label
									htmlFor="active-model"
									className="text-[10px] font-black text-slate-500 uppercase tracking-widest"
								>
									Active Model
								</label>
								<select
									id="active-model"
									value={modelConfig.model}
									onChange={(e) =>
										setModelConfig({ ...modelConfig, model: e.target.value })
									}
									className="w-full px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 focus:border-amber-400 outline-none transition-all text-sm font-bold text-slate-200"
								>
									<option value="gemini-2.0-flash">
										Gemini 2.0 Flash (Fast)
									</option>
									<option value="gemini-1.5-pro">
										Gemini 1.5 Pro (Brainy)
									</option>
								</select>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between items-end">
									<label
										htmlFor="temperature"
										className="text-[10px] font-black text-slate-500 uppercase tracking-widest"
									>
										Temperature
									</label>
									<span className="text-[10px] font-black text-amber-400">
										{modelConfig.temperature}
									</span>
								</div>
								<input
									id="temperature"
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
									className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-full appearance-none"
								/>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between items-end">
									<label
										htmlFor="output-tokens"
										className="text-[10px] font-black text-slate-500 uppercase tracking-widest"
									>
										Output Tokens
									</label>
									<span className="text-[10px] font-black text-amber-400">
										{modelConfig.maxOutputTokens}
									</span>
								</div>
								<input
									id="output-tokens"
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
									className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-full appearance-none"
								/>
							</div>
						</div>
					</section>

					{/* Schedule Section */}
					<section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
						<h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-3">
							<span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
								<Clock size={20} />
							</span>
							Scheduling
						</h3>

						<div className="space-y-6">
							<label className="flex items-center gap-3 cursor-pointer group">
								<div
									className={`w-10 h-6 rounded-full p-1 transition-all ${scheduledPosting.enabled ? "bg-amber-500" : "bg-gray-200"}`}
								>
									<div
										className={`w-4 h-4 bg-white rounded-full transition-all transform ${scheduledPosting.enabled ? "translate-x-4" : "translate-x-0"}`}
									/>
								</div>
								<input
									type="checkbox"
									className="hidden"
									checked={scheduledPosting.enabled}
									onChange={(e) =>
										setScheduledPosting({
											...scheduledPosting,
											enabled: e.target.checked,
										})
									}
								/>
								<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
									Active Schedule
								</span>
							</label>

							<div className="space-y-2">
								<label
									htmlFor="cron-expression"
									className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
								>
									Cron Expression
								</label>
								<input
									id="cron-expression"
									type="text"
									value={scheduledPosting.schedule}
									onChange={(e) =>
										setScheduledPosting({
											...scheduledPosting,
											schedule: e.target.value,
										})
									}
									className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:bg-white focus:border-amber-500 outline-none transition-all bg-gray-50/50 text-sm font-mono text-gray-800"
								/>
								<p className="text-[10px] text-gray-400 font-medium px-1">
									Example: <span className="text-gray-600">0 9 * * *</span>{" "}
									(Daily at 9 AM)
								</p>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
