/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				primary: {
					DEFAULT: "var(--primary)",
					foreground: "var(--primary-foreground)",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					foreground: "var(--secondary-foreground)",
				},
				accent: {
					DEFAULT: "var(--accent)",
					foreground: "var(--accent-foreground)",
				},
				muted: {
					DEFAULT: "var(--muted)",
					foreground: "var(--muted-foreground)",
				},
				card: {
					DEFAULT: "var(--card)",
					foreground: "var(--card-foreground)",
				},
				border: "var(--border)",
				input: "var(--input)",
				ring: "var(--ring)",
				error: {
					DEFAULT: "var(--error)",
					foreground: "var(--error-foreground)",
					border: "var(--error-border)",
				},
			},
			fill: {
				// Add fill property
				background: "var(--background)",
				foreground: "var(--foreground)",
				primary: "var(--primary)",
				secondary: "var(--secondary)",
				accent: "var(--accent)",
				muted: "var(--muted)",
				card: "var(--card)",
				border: "var(--border)",
				input: "var(--input)",
				ring: "var(--ring)",
				error: "var(--error)",
			},
			stroke: {
				// Add stroke property
				background: "var(--background)",
				foreground: "var(--foreground)",
				primary: "var(--primary)",
				secondary: "var(--secondary)",
				accent: "var(--accent)",
				muted: "var(--muted)",
				card: "var(--card)",
				border: "var(--border)",
				input: "var(--input)",
				ring: "var(--ring)",
				error: "var(--error)",
			},
		},
	},
	plugins: [],
};
