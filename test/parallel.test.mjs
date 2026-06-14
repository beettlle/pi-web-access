import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const parallelModuleUrl = new URL("../parallel.ts", import.meta.url).href;
const geminiSearchModuleUrl = new URL("../gemini-search.ts", import.meta.url).href;
const indexModulePath = new URL("../index.ts", import.meta.url).pathname;

function runResolveProviderCheck(home, requestedProvider, availableProviders) {
	return runWithHome(
		home,
		`
import { readFileSync } from "node:fs";

const indexSource = readFileSync(${JSON.stringify(indexModulePath)}, "utf8");

function extractTypeScriptFunction(source, functionName) {
	const marker = "function " + functionName + "(";
	const start = source.indexOf(marker);
	if (start === -1) throw new Error("Could not find function " + functionName);
	let braceIndex = source.indexOf("{", start);
	if (braceIndex === -1) throw new Error("Could not find opening brace for " + functionName);
	let depth = 0;
	for (let i = braceIndex; i < source.length; i++) {
		if (source[i] === "{") depth++;
		else if (source[i] === "}") {
			depth--;
			if (depth === 0) return source.slice(start, i + 1);
		}
	}
	throw new Error("Unbalanced braces for " + functionName);
}

function stripTypeScriptTypes(source) {
	return source
		.replace(/:\\s*ResolvedSearchProvider/g, "")
		.replace(/:\\s*SearchProvider\\s*\\|\\s*undefined/g, "")
		.replace(/:\\s*ProviderAvailability/g, "")
		.replace(/:\\s*unknown/g, "")
		.replace(/:\\s*WebSearchConfig/g, "");
}

const normalizeProviderInput = eval("(" + stripTypeScriptTypes(extractTypeScriptFunction(indexSource, "normalizeProviderInput")) + ")");
const loadConfig = () => ({});
const resolveProvider = eval("(" + stripTypeScriptTypes(extractTypeScriptFunction(indexSource, "resolveProvider")) + ")");

const requestedProvider = ${JSON.stringify(requestedProvider)};
const availableProviders = ${JSON.stringify(availableProviders)};
console.log(resolveProvider(requestedProvider, availableProviders));
		`,
	);
}

async function createTempHome(prefix = "pi-web-access-parallel-") {
	return mkdtemp(join(tmpdir(), prefix));
}

async function writeWebSearchConfig(home, config) {
	await mkdir(join(home, ".pi"), { recursive: true });
	await writeFile(
		join(home, ".pi", "web-search.json"),
		JSON.stringify(config) + "\n",
		"utf8",
	);
}

function runWithHome(home, script, extraEnv = {}) {
	const env = { ...process.env, HOME: home, USERPROFILE: home };
	delete env.PARALLEL_API_KEY;
	Object.assign(env, extraEnv);

	return spawnSync(process.execPath, ["--input-type=module"], {
		input: wrapChildScript(script),
		encoding: "utf8",
		env,
		maxBuffer: 2 * 1024 * 1024,
	});
}

function wrapChildScript(script) {
	return `
process.on("uncaughtException", (error) => {
	console.error(error?.stack || error);
	process.exit(1);
});
process.on("unhandledRejection", (error) => {
	console.error(error?.stack || error);
	process.exit(1);
});

${script}
`;
}

function buildFetchMockScript(mocks) {
	return `
const __parallelFetchMocks = ${JSON.stringify(mocks)};
const __parallelFetchCalls = [];

globalThis.fetch = async (url, init = {}) => {
	const urlStr = String(url);
	const method = init.method ?? "GET";
	const bodyText = init.body == null ? null : String(init.body);
	const body = bodyText ? JSON.parse(bodyText) : null;
	const call = { url: urlStr, method, headers: init.headers ?? {}, body };
	__parallelFetchCalls.push(call);

	const mock = __parallelFetchMocks.find((entry) => {
		if (entry.url && urlStr === entry.url) return true;
		if (entry.urlMatch && urlStr.includes(entry.urlMatch)) return true;
		return false;
	});

	if (!mock) {
		throw new Error("Unexpected fetch to " + urlStr);
	}

	const responseBody = typeof mock.response === "function"
		? mock.response(call)
		: mock.response;

	return {
		ok: mock.ok ?? true,
		status: mock.status ?? 200,
		async text() {
			return typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody);
		},
		async json() {
			return typeof responseBody === "string" ? JSON.parse(responseBody) : responseBody;
		},
	};
};

globalThis.__getParallelFetchCalls = () => __parallelFetchCalls;
`;
}

function buildActivityMockRegisterScript() {
	const hookSource = [
		"export async function resolve(specifier, context, nextResolve) {",
		'  if (specifier.endsWith("activity.js")) {',
		"    return {",
		'      url: "data:text/javascript," + encodeURIComponent(' +
			JSON.stringify(
				"export const activityMonitor = { logStart: () => \"mock-activity-id\", logComplete: () => {}, logError: () => {} };",
			) +
			"),",
		'      format: "module",',
		"      shortCircuit: true,",
		"    };",
		"  }",
		'  if (specifier.endsWith(".js") && !specifier.startsWith("node:")) {',
		"    const tsSpecifier = specifier.replace(/\\.js$/, \".ts\");",
		"    return nextResolve(tsSpecifier, context);",
		"  }",
		"  return nextResolve(specifier, context);",
		"}",
	].join("\n");

	return `
import { register } from "node:module";
register("data:text/javascript," + encodeURIComponent(${JSON.stringify(hookSource)}), import.meta.url);
`;
}

function buildParallelImportPreamble() {
	return `${buildActivityMockRegisterScript()}`;
}

function assertChildSuccess(child, label = "child process") {
	assert.equal(child.status, 0, `${label} failed:\n${child.stderr}`);
}

function runIsParallelAvailableCheck(home, extraEnv = {}) {
	return runWithHome(
		home,
		`${buildParallelImportPreamble()}
const { isParallelAvailable } = await import(${JSON.stringify(parallelModuleUrl)});
console.log(String(isParallelAvailable()));`,
		extraEnv,
	);
}

function runSearchWithParallel(home, scriptBody, extraEnv = {}) {
	return runWithHome(
		home,
		`${buildParallelImportPreamble()}
const { searchWithParallel } = await import(${JSON.stringify(parallelModuleUrl)});
${scriptBody}`,
		extraEnv,
	);
}

function runExtractWithParallel(home, scriptBody, extraEnv = {}) {
	return runWithHome(
		home,
		`${buildParallelImportPreamble()}
const { extractWithParallel } = await import(${JSON.stringify(parallelModuleUrl)});
${scriptBody}`,
		extraEnv,
	);
}

function runGeminiSearch(home, scriptBody, extraEnv = {}) {
	return runWithHome(
		home,
		`${buildParallelImportPreamble()}
const { search } = await import(${JSON.stringify(geminiSearchModuleUrl)});
${scriptBody}`,
		extraEnv,
	);
}

function buildRoutingFetchMockScript(handlers) {
	return `
const __routingFetchHandlers = ${JSON.stringify(handlers)};
const __routingFetchCalls = [];

globalThis.fetch = async (url, init = {}) => {
	const urlStr = String(url);
	const method = init.method ?? "GET";
	const bodyText = init.body == null ? null : String(init.body);
	const body = bodyText ? JSON.parse(bodyText) : null;
	const call = { url: urlStr, method, headers: init.headers ?? {}, body };
	__routingFetchCalls.push(call);

	const handler = __routingFetchHandlers.find((entry) => {
		if (entry.url && urlStr === entry.url) return true;
		if (entry.urlMatch && urlStr.includes(entry.urlMatch)) return true;
		return false;
	});

	if (!handler) {
		throw new Error("Unexpected fetch to " + urlStr);
	}

	const responseBody = typeof handler.response === "function"
		? handler.response(call)
		: handler.response;

	return {
		ok: handler.ok ?? true,
		status: handler.status ?? 200,
		async text() {
			if (responseBody == null) return "";
			return typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody);
		},
		async json() {
			if (responseBody == null) return null;
			return typeof responseBody === "string" ? JSON.parse(responseBody) : responseBody;
		},
	};
};

globalThis.__getRoutingFetchCalls = () => __routingFetchCalls;
`;
}

const extractTargetUrl = "https://example.test/article";

function buildUsefulContent(char = "x", length = 520) {
	return char.repeat(length);
}

const sampleV1SearchResponse = {
	results: [
		{
			url: "https://example.test/article",
			title: "Example Article",
			excerpts: ["First excerpt.", "Second excerpt."],
		},
		{
			url: "https://example.test/other",
			title: "Other Page",
			excerpts: ["Other content here."],
		},
	],
};

test("isParallelAvailable returns false with empty HOME", async () => {
	const home = await createTempHome();
	const child = runIsParallelAvailableCheck(home);

	assertChildSuccess(child);
	assert.equal(child.stdout.trim(), "false");
});

test("isParallelAvailable returns true with parallelApiKey in web-search.json", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });

	const child = runIsParallelAvailableCheck(home);

	assertChildSuccess(child);
	assert.equal(child.stdout.trim(), "true");
});

test("isParallelAvailable returns true with PARALLEL_API_KEY env", async () => {
	const home = await createTempHome();
	const child = runIsParallelAvailableCheck(home, { PARALLEL_API_KEY: "env-key-ok" });

	assertChildSuccess(child);
	assert.equal(child.stdout.trim(), "true");
});

test("isParallelAvailable returns false for placeholder parallelApiKey values", async () => {
	const home = await createTempHome();
	const placeholders = [
		"REPLACE_WITH_YOUR_PARALLEL_API_KEY",
		"dummy",
		"your-key",
		"PARALLEL_API_KEY",
	];

	for (const parallelApiKey of placeholders) {
		await writeWebSearchConfig(home, { parallelApiKey });
		const child = runIsParallelAvailableCheck(home);

		assertChildSuccess(child, `placeholder ${parallelApiKey}`);
		assert.equal(child.stdout.trim(), "false", `expected false for ${parallelApiKey}`);
	}
});

test("isParallelAvailable returns true for valid-shaped parallelApiKey", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "pk_live_abc1234567890ab" });

	const child = runIsParallelAvailableCheck(home);

	assertChildSuccess(child);
	assert.equal(child.stdout.trim(), "true");
});

test("isParallelAvailable prefers valid PARALLEL_API_KEY over placeholder config key", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "REPLACE_WITH_YOUR_PARALLEL_API_KEY" });

	const child = runIsParallelAvailableCheck(home, { PARALLEL_API_KEY: "pk_env_abc1234567890ab" });

	assertChildSuccess(child);
	assert.equal(child.stdout.trim(), "true");
});

test("runWithHome uses an isolated HOME directory", async () => {
	const home = await createTempHome();
	const child = runWithHome(home, `console.log(process.env.HOME);`);

	assertChildSuccess(child);
	assert.equal(child.stdout.trim(), home);
});

test("writeWebSearchConfig writes ~/.pi/web-search.json under temp HOME", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });

	const child = runWithHome(home, `
		const { readFileSync } = await import("node:fs");
		const { join } = await import("node:path");
		const configPath = join(process.env.HOME, ".pi", "web-search.json");
		console.log(readFileSync(configPath, "utf8").trim());
	`);

	assertChildSuccess(child);
	assert.equal(child.stdout.trim(), JSON.stringify({ parallelApiKey: "test-key" }));
});

test("fetch mock intercepts Parallel API requests in spawned child", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });

	const child = runWithHome(home, `
${buildFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/search",
		response: {
			results: [
				{
					url: "https://example.test/article",
					title: "Example",
					excerpts: ["Mock excerpt"],
				},
			],
		},
	},
])}
const response = await fetch("https://api.parallel.ai/v1/search", {
	method: "POST",
	headers: {
		"x-api-key": "test-key",
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		objective: "parallel harness",
		search_queries: ["parallel harness"],
	}),
});
const payload = await response.json();
const calls = globalThis.__getParallelFetchCalls();
console.log(JSON.stringify({
	resultCount: payload.results?.length ?? 0,
	callCount: calls.length,
	url: calls[0]?.url ?? "",
	body: calls[0]?.body ?? null,
}));
	`);

	assertChildSuccess(child);
	const result = JSON.parse(child.stdout.trim());
	assert.equal(result.resultCount, 1);
	assert.equal(result.callCount, 1);
	assert.match(result.url, /api\.parallel\.ai\/v1\/search/);
	assert.equal(result.body?.objective, "parallel harness");
});

test("parallel module URL is wired for downstream imports", () => {
	assert.match(parallelModuleUrl, /parallel\.ts$/);
});

test("searchWithParallel maps V1SearchResponse to answer, results, and inlineContent", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });

	const child = runSearchWithParallel(home, `
${buildFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/search",
		response: sampleV1SearchResponse,
	},
])}
const result = await searchWithParallel("parallel search query", { includeContent: true });
console.log(JSON.stringify({
	answer: result.answer,
	results: result.results,
	inlineContent: result.inlineContent,
	callBody: globalThis.__getParallelFetchCalls()[0]?.body ?? null,
}));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());

	assert.match(parsed.answer, /First excerpt\.\s+Second excerpt\./);
	assert.match(parsed.answer, /Source: Example Article \(https:\/\/example\.test\/article\)/);
	assert.match(parsed.answer, /Other content here\./);
	assert.match(parsed.answer, /Source: Other Page \(https:\/\/example\.test\/other\)/);
	assert.equal(parsed.results.length, 2);
	assert.equal(parsed.results[0].url, "https://example.test/article");
	assert.equal(parsed.results[0].title, "Example Article");
	assert.equal(parsed.results[0].snippet, "");
	assert.equal(parsed.inlineContent?.length, 2);
	assert.equal(parsed.inlineContent[0].url, "https://example.test/article");
	assert.equal(parsed.inlineContent[0].content, "First excerpt.\n\nSecond excerpt.");
	assert.equal(parsed.callBody?.objective, "parallel search query");
	assert.deepEqual(parsed.callBody?.search_queries, ["parallel search query"]);
});

test("searchWithParallel returns empty answer for empty results", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });

	const child = runSearchWithParallel(home, `
${buildFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/search",
		response: { results: [] },
	},
])}
const result = await searchWithParallel("empty results query", { includeContent: true });
console.log(JSON.stringify({
	answer: result.answer,
	results: result.results,
	inlineContent: result.inlineContent,
}));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());

	assert.equal(parsed.answer, "");
	assert.deepEqual(parsed.results, []);
	assert.equal(parsed.inlineContent, undefined);
});

test("searchWithParallel sends domain and recency fields in request body", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });

	const child = runSearchWithParallel(home, `
${buildFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/search",
		response: { results: [] },
	},
])}
const result = await searchWithParallel("filtered query", {
	domainFilter: ["example.com", "-spam.com"],
	recencyFilter: "week",
	numResults: 10,
});
const callBody = globalThis.__getParallelFetchCalls()[0]?.body ?? null;
console.log(JSON.stringify({
	resultCount: result.results.length,
	callBody,
}));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());
	const sourcePolicy = parsed.callBody?.advanced_settings?.source_policy;

	assert.equal(parsed.resultCount, 0);
	assert.equal(parsed.callBody?.objective, "filtered query");
	assert.deepEqual(parsed.callBody?.search_queries, ["filtered query"]);
	assert.equal(parsed.callBody?.advanced_settings?.max_results, 10);
	assert.deepEqual(sourcePolicy?.include_domains, ["example.com"]);
	assert.deepEqual(sourcePolicy?.exclude_domains, ["spam.com"]);
	assert.match(sourcePolicy?.after_date, /^\d{4}-\d{2}-\d{2}$/);

	const afterDate = new Date(`${sourcePolicy.after_date}T00:00:00Z`);
	const weekAgo = new Date(Date.now() - 7 * 86400000);
	const dayMs = 86400000;
	assert.ok(Math.abs(afterDate.getTime() - weekAgo.getTime()) < 2 * dayMs);
});

test("extractWithParallel maps full_content from V1ExtractResponse", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });
	const fullContent = buildUsefulContent("A");
	const shortExcerpt = "Ignored excerpt when full_content is present.";

	const child = runExtractWithParallel(home, `
${buildFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/extract",
		response: {
			results: [
				{
					url: extractTargetUrl,
					title: "Article Title",
					full_content: fullContent,
					excerpts: [shortExcerpt],
				},
			],
		},
	},
])}
const result = await extractWithParallel(${JSON.stringify(extractTargetUrl)});
console.log(JSON.stringify({
	result,
	callBody: globalThis.__getParallelFetchCalls()[0]?.body ?? null,
}));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());

	assert.ok(parsed.result);
	assert.equal(parsed.result.url, extractTargetUrl);
	assert.equal(parsed.result.title, "Article Title");
	assert.equal(parsed.result.content, fullContent);
	assert.equal(parsed.result.error, null);
	assert.deepEqual(parsed.callBody?.urls, [extractTargetUrl]);
});

test("extractWithParallel maps joined excerpts when full_content is absent", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });
	const excerptOne = buildUsefulContent("a", 260);
	const excerptTwo = buildUsefulContent("b", 260);
	const expectedContent = `${excerptOne}\n\n${excerptTwo}`;

	const child = runExtractWithParallel(home, `
${buildFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/extract",
		response: {
			results: [
				{
					url: extractTargetUrl,
					title: "Excerpt Article",
					excerpts: [excerptOne, excerptTwo],
				},
			],
		},
	},
])}
const result = await extractWithParallel(${JSON.stringify(extractTargetUrl)});
console.log(JSON.stringify({ result }));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());

	assert.ok(parsed.result);
	assert.equal(parsed.result.url, extractTargetUrl);
	assert.equal(parsed.result.title, "Excerpt Article");
	assert.equal(parsed.result.content, expectedContent);
	assert.equal(parsed.result.error, null);
});

test("extractWithParallel returns null when mapped content is below MIN_USEFUL_CONTENT", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });
	const shortContent = buildUsefulContent("s", 120);

	const child = runExtractWithParallel(home, `
${buildFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/extract",
		response: {
			results: [
				{
					url: extractTargetUrl,
					title: "Short Article",
					full_content: shortContent,
				},
			],
		},
	},
])}
const result = await extractWithParallel(${JSON.stringify(extractTargetUrl)});
console.log(JSON.stringify({ result }));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());
	assert.equal(parsed.result, null);
});

test("extractWithParallel returns null when url appears in errors array", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });
	const usefulContent = buildUsefulContent("e");

	const child = runExtractWithParallel(home, `
${buildFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/extract",
		response: {
			results: [
				{
					url: extractTargetUrl,
					title: "Errored Article",
					full_content: usefulContent,
				},
			],
			errors: [extractTargetUrl],
		},
	},
])}
const result = await extractWithParallel(${JSON.stringify(extractTargetUrl)});
console.log(JSON.stringify({ result }));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());
	assert.equal(parsed.result, null);
});

test("normalizeSearchProvider accepts parallel from web-search.json config", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, {
		searchProvider: "Parallel",
		parallelApiKey: "test-key",
	});

	const child = runGeminiSearch(home, `
${buildRoutingFetchMockScript([
	{
		urlMatch: "api.parallel.ai/v1/search",
		response: sampleV1SearchResponse,
	},
])}
const sampleV1SearchResponse = ${JSON.stringify(sampleV1SearchResponse)};
const result = await search("normalize provider query");
const calls = globalThis.__getRoutingFetchCalls();
console.log(JSON.stringify({
	provider: result.provider,
	parallelCallCount: calls.filter((call) => call.url.includes("api.parallel.ai/v1/search")).length,
}));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());
	assert.equal(parsed.provider, "parallel");
	assert.equal(parsed.parallelCallCount, 1);
});

test("auto chain calls Parallel /v1/search when only parallelApiKey is configured", async () => {
	const home = await createTempHome();
	await writeWebSearchConfig(home, { parallelApiKey: "test-key" });

	const child = runGeminiSearch(home, `
${buildRoutingFetchMockScript([
	{
		urlMatch: "mcp.exa.ai/mcp",
		ok: false,
		status: 503,
		response: "Exa MCP unavailable",
	},
	{
		urlMatch: "api.parallel.ai/v1/search",
		response: sampleV1SearchResponse,
	},
])}
const sampleV1SearchResponse = ${JSON.stringify(sampleV1SearchResponse)};
const result = await search("auto chain parallel query", { provider: "auto" });
const calls = globalThis.__getRoutingFetchCalls();
console.log(JSON.stringify({
	provider: result.provider,
	parallelCalls: calls.filter((call) => call.url.includes("api.parallel.ai/v1/search")).length,
	perplexityCalls: calls.filter((call) => call.url.includes("api.perplexity.ai")).length,
	geminiCalls: calls.filter((call) => call.url.includes("generativelanguage.googleapis.com")).length,
}));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());
	assert.equal(parsed.provider, "parallel");
	assert.equal(parsed.parallelCalls, 1);
	assert.equal(parsed.perplexityCalls, 0);
	assert.equal(parsed.geminiCalls, 0);
});

test("auto chain skips api.parallel.ai when Parallel key is not configured", async () => {
	const home = await createTempHome();

	const child = runGeminiSearch(home, `
${buildRoutingFetchMockScript([
	{
		urlMatch: "mcp.exa.ai/mcp",
		response: 'data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"No results found"}]}}\\n',
	},
])}
let searchError = null;
try {
	await search("auto chain without parallel key", { provider: "auto" });
} catch (err) {
	searchError = err instanceof Error ? err.message : String(err);
}
const calls = globalThis.__getRoutingFetchCalls();
console.log(JSON.stringify({
	parallelCalls: calls.filter((call) => call.url.includes("api.parallel.ai")).length,
	searchError,
}));
	`);

	assertChildSuccess(child);
	const parsed = JSON.parse(child.stdout.trim());
	assert.equal(parsed.parallelCalls, 0);
	assert.ok(parsed.searchError, "expected auto search to fail without any provider");
	assert.doesNotMatch(parsed.searchError, /api\.parallel\.ai/);
});

test("resolveProvider does not return parallel when unavailable and no providers exist", async () => {
	const home = await createTempHome();
	const unavailable = {
		exa: false,
		parallel: false,
		perplexity: false,
		gemini: false,
	};

	const child = runResolveProviderCheck(home, "parallel", unavailable);

	assertChildSuccess(child, "resolveProvider check");
	assert.notEqual(child.stdout.trim(), "parallel");
	assert.equal(child.stdout.trim(), "exa");
});
