// src/pages/api/simulate.ts
import type { APIRoute } from "astro";
import { z } from 'zod';

const directions = ["N", "E", "S", "W"] as const;
const moveOffsets = {
	N: [0, 1],
	E: [1, 0],
	S: [0, -1],
	W: [-1, 0],
};

function turn(dir: string, command: string): string {
	let idx = directions.indexOf(dir as any);
	if (command === "L") idx = (idx + 3) % 4;
	if (command === "R") idx = (idx + 1) % 4;
	return directions[idx];
}

function simulateInput(inputText: string): string {
	const lines = inputText
		.trim()
		.split("\n")
		.map((l) => l.trim());
	const [maxX, maxY] = lines[0].split(" ").map(Number);
	const gridMax = [maxX, maxY];

	const results: string[] = [];
	const scents = new Set<string>();

	for (let i = 1; i < lines.length; i += 2) {
		const [xStr, yStr, dir] = lines[i].split(" ");
		let x = +xStr,
			y = +yStr,
			direction = dir as keyof typeof moveOffsets;
		const instructions = lines[i + 1];
		let lost = false;

		for (const cmd of instructions) {
			if (cmd === "L" || cmd === "R") {
				direction = turn(direction, cmd) as keyof typeof moveOffsets;
			} else if (cmd === "F") {
				const [dx, dy] = moveOffsets[direction];
				const nx = x + dx,
					ny = y + dy;

				if (nx < 0 || ny < 0 || nx > gridMax[0] || ny > gridMax[1]) {
					const scentKey = `${x},${y},${direction}`;
					if (!scents.has(scentKey)) {
						lost = true;
						scents.add(scentKey);
						break;
					}
				} else {
					x = nx;
					y = ny;
				}
			}
		}

		results.push(`${x} ${y} ${direction}${lost ? " LOST" : ""}`);
	}

	return results.join("\n");
}

export const POST: APIRoute = async ({ request }) => {
	let bodyText = "";
	try {
		bodyText = await request.text();
		const data = JSON.parse(bodyText);
		const schema = z.object({ input: z.string().min(1) });
		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			return new Response(
				JSON.stringify({ error: "Invalid input format", issues: parsed.error.issues, received: bodyText }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		const input = parsed.data.input;
		const result = simulateInput(input);
		return new Response(JSON.stringify({ result }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: "Invalid or missing JSON input.", received: bodyText }), {
			headers: { "Content-Type": "application/json" },
			status: 400,
		});
	}
};
