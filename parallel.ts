import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { activityMonitor } from "./activity.js";
import type { ExtractedContent } from "./extract.js";
import type { SearchOptions, SearchResponse } from "./perplexity.js";

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

export interface V1WebSearchResult {
	url: string;
	title?: string | null;
	publish_date?: string | null;
	excerpts?: string[];
}

export interface V1ExtractResult {
	url: string;
	title?: string | null;
	publish_date?: string | null;
	excerpts?: string[];
	full_content?: string | null;
}

/** Matches MIN_USEFUL_CONTENT in extract.ts */
const MIN_USEFUL_CONTENT = 500;

export interface ParallelSearchOptions extends SearchOptions {
	includeContent?: boolean;
}

export function recencyToAfterDate(filter: string): string {
	const now = new Date();
	const offsets: Record<string, number> = {
		day: 1,
		week: 7,
		month: 30,
		year: 365,
	};
	const days = offsets[filter] ?? 0;
	return new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
}

export function mapDomainFilter(
	domainFilter: string[] | undefined,
): { include_domains?: string[]; exclude_domains?: string[] } {
	if (!domainFilter?.length) return {};
	const include_domains = domainFilter
		.filter(d => !d.startsWith("-") && d.trim().length > 0)
		.map(d => d.trim());
	const exclude_domains = domainFilter
		.filter(d => d.startsWith("-"))
		.map(d => d.slice(1).trim())
		.filter(Boolean);
	return {
		...(include_domains.length ? { include_domains } : {}),
		...(exclude_domains.length ? { exclude_domains } : {}),
	};
}

export function buildSearchRequestBody(
	query: string,
	options: ParallelSearchOptions = {},
): Record<string, unknown> {
	const numResults = Math.min(options.numResults ?? 5, 20);
	const domainFilters = mapDomainFilter(options.domainFilter);
	const afterDate = options.recencyFilter ? recencyToAfterDate(options.recencyFilter) : undefined;
	const sourcePolicy = {
		...domainFilters,
		...(afterDate ? { after_date: afterDate } : {}),
	};

	return {
		objective: query,
		search_queries: [query],
		advanced_settings: {
			max_results: numResults,
			...(Object.keys(sourcePolicy).length > 0 ? { source_policy: sourcePolicy } : {}),
		},
	};
}

function normalizeExcerpts(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function mapSearchResults(results: V1WebSearchResult[] | undefined): SearchResponse["results"] {
	if (!Array.isArray(results)) return [];
	const mapped: SearchResponse["results"] = [];
	for (let i = 0; i < results.length; i++) {
		const item = results[i];
		if (!item?.url) continue;
		mapped.push({
			title: item.title || `Source ${i + 1}`,
			url: item.url,
			snippet: "",
		});
	}
	return mapped;
}

export function buildAnswerFromExcerpts(results: V1WebSearchResult[] | undefined): string {
	if (!results?.length) return "";
	const parts: string[] = [];
	for (let i = 0; i < results.length; i++) {
		const item = results[i];
		if (!item?.url) continue;
		const excerpts = normalizeExcerpts(item.excerpts);
		if (!excerpts.length) continue;
		const content = excerpts.join(" ");
		const sourceTitle = item.title || `Source ${i + 1}`;
		parts.push(`${content}\nSource: ${sourceTitle} (${item.url})`);
	}
	return parts.join("\n\n");
}

export function mapInlineContent(results: V1WebSearchResult[] | undefined): ExtractedContent[] {
	if (!results?.length) return [];
	return results
		.filter((r): r is V1WebSearchResult & { url: string; excerpts: string[] } =>
			!!r?.url && normalizeExcerpts(r.excerpts).length > 0)
		.map(r => ({
			url: r.url,
			title: r.title || "",
			content: normalizeExcerpts(r.excerpts).join("\n\n"),
			error: null,
		}));
}

function resolveExtractContent(result: V1ExtractResult): string {
	const fullContent = typeof result.full_content === "string" ? result.full_content.trim() : "";
	if (fullContent.length > 0) return fullContent;
	return normalizeExcerpts(result.excerpts).join("\n\n");
}

export function mapExtractResult(
	result: V1ExtractResult | undefined | null,
): { url: string; title: string; content: string } | null {
	if (!result?.url) return null;
	const content = resolveExtractContent(result);
	if (content.length < MIN_USEFUL_CONTENT) return null;
	return {
		url: result.url,
		title: typeof result.title === "string" ? result.title.trim() : "",
		content,
	};
}

export async function searchWithParallel(
	query: string,
	options: ParallelSearchOptions = {},
): Promise<SearchResponse> {
	const body = buildSearchRequestBody(query, options);
	const data = await parallelFetch(PARALLEL_SEARCH_URL, body, options.signal);
	const results = data.results as V1WebSearchResult[] | undefined;

	const response: SearchResponse = {
		answer: buildAnswerFromExcerpts(results),
		results: mapSearchResults(results),
	};

	if (options.includeContent) {
		const inlineContent = mapInlineContent(results);
		if (inlineContent.length > 0) {
			response.inlineContent = inlineContent;
		}
	}

	return response;
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

