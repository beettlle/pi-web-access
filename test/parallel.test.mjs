import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const parallelModuleUrl = new URL("../parallel.ts", import.meta.url).href;

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
	const child = runIsParallelAvailableCheck(home, { PARALLEL_API_KEY: "env-key" });

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
