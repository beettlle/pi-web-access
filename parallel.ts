import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { activityMonitor } from "./activity.js";

const PARALLEL_SEARCH_URL = "https://api.parallel.ai/v1/search";
const PARALLEL_EXTRACT_URL = "https://api.parallel.ai/v1/extract";
const CONFIG_PATH = join(homedir(), ".pi", "web-search.json");

interface WebSearchConfig {
	parallelApiKey?: unknown;
}

let cachedConfig: WebSearchConfig | null = null;

function loadConfig(): WebSearchConfig {
	if (cachedConfig) return cachedConfig;
	if (!existsSync(CONFIG_PATH)) {
		cachedConfig = {};
		return cachedConfig;
	}

	const content = readFileSync(CONFIG_PATH, "utf-8");
	try {
		cachedConfig = JSON.parse(content) as WebSearchConfig;
		return cachedConfig;
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to parse ${CONFIG_PATH}: ${message}`);
	}
}

function normalizeApiKey(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}

function resolveApiKey(): string | null {
	const config = loadConfig();
	return normalizeApiKey(process.env.PARALLEL_API_KEY) ?? normalizeApiKey(config.parallelApiKey);
}

function getApiKey(): string {
	const key = resolveApiKey();
	if (!key) {
		throw new Error(
			"Parallel API key not found. Either:\n" +
			`  1. Create ${CONFIG_PATH} with { "parallelApiKey": "your-key" }\n` +
			"  2. Set PARALLEL_API_KEY environment variable\n" +
			"Get a key at https://platform.parallel.ai"
		);
	}
	return key;
}

export function hasParallelApiKey(): boolean {
	return !!resolveApiKey();
}

export function isParallelAvailable(): boolean {
	return hasParallelApiKey();
}

function requestSignal(signal?: AbortSignal): AbortSignal {
	const timeout = AbortSignal.timeout(60000);
	return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

function isAbortError(err: unknown): boolean {
	return errorMessage(err).toLowerCase().includes("abort");
}

function activityContext(
	url: string,
	body: Record<string, unknown>,
): { type: "api" | "fetch"; query?: string; url?: string } {
	if (typeof body.objective === "string" && body.objective.trim().length > 0) {
		return { type: "api", query: body.objective };
	}

	const searchQueries = body.search_queries;
	if (Array.isArray(searchQueries) && typeof searchQueries[0] === "string") {
		return { type: "api", query: searchQueries[0] };
	}

	const urls = body.urls;
	if (Array.isArray(urls) && typeof urls[0] === "string") {
		return { type: "fetch", url: urls[0] };
	}

	if (url.includes("/search")) {
		return { type: "api", query: "Parallel search" };
	}

	return { type: "fetch", url };
}

async function parallelFetch(
	url: string,
	body: Record<string, unknown>,
	signal?: AbortSignal,
): Promise<Record<string, unknown>> {
	const apiKey = getApiKey();
	const activityId = activityMonitor.logStart(activityContext(url, body));

	let response: Response;
	try {
		response = await fetch(url, {
			method: "POST",
			headers: {
				"x-api-key": apiKey,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
			signal: requestSignal(signal),
		});
	} catch (err) {
		if (isAbortError(err)) {
			activityMonitor.logComplete(activityId, 0);
		} else {
			activityMonitor.logError(activityId, errorMessage(err));
		}
		throw err;
	}

	if (!response.ok) {
		activityMonitor.logComplete(activityId, response.status);
		const errorText = await response.text();
		throw new Error(`Parallel API error ${response.status}: ${errorText}`);
	}

	try {
		const data = await response.json() as Record<string, unknown>;
		activityMonitor.logComplete(activityId, response.status);
		return data;
	} catch (err) {
		activityMonitor.logComplete(activityId, response.status);
		throw new Error(`Parallel API returned invalid JSON: ${errorMessage(err)}`);
	}
}

