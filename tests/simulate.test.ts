import { describe, it, beforeEach, vi, expect } from "vitest";

describe("simulateBtn click (frontend fetch)", () => {
	beforeEach(() => {
		// Reset the DOM
		document.body.innerHTML = `
      <textarea id="inputArea"></textarea>
      <button id="simulateBtn">Simulate</button>
      <pre id="outputArea"></pre>
    `;
	});

	it("sends input to API and updates output area", async () => {
		// Arrange
		const mockFetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ result: "Simulated successfully" }),
				text: () => Promise.resolve("Simulated successfully"),
				// Add any other Response properties if needed
			} as Response)
		);
		global.fetch = mockFetch as unknown as typeof fetch;

		const simulateClickHandler = async () => {
			const input = (document.getElementById("inputArea") as HTMLTextAreaElement)?.value || "";
			const outputEl = document.getElementById("outputArea");
			if (outputEl) {
				outputEl.textContent = "Processing...";
			}

			try {
				const res = await fetch("/api/simulate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ input }),
				});

				const data = await res.json();
				if (outputEl) {
					outputEl.textContent = data.result || "No result";
				}
			} catch (e) {
				if (outputEl) {
					outputEl.textContent = e instanceof Error ? e.message : String(e);
				}
			}
		};

		// Hook up event
		document.getElementById("simulateBtn")?.addEventListener("click", simulateClickHandler);

		// Set input and trigger click
		const inputArea = document.getElementById("inputArea") as HTMLTextAreaElement;
		inputArea.value = "5 3\n1 1 E\nRFRFRFRF";

		document.getElementById("simulateBtn")?.click();

		// Wait for DOM updates
		await new Promise((resolve) => setTimeout(resolve, 10));

		// Assert
		const output = document.getElementById("outputArea")?.textContent;
		expect(output).toBe("Simulated successfully");
		expect(mockFetch).toHaveBeenCalledOnce();
		expect(mockFetch).toHaveBeenCalledWith("/api/simulate", expect.any(Object));
	});
});
