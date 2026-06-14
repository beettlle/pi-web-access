import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

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

