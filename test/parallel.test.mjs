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

function assertChildSuccess(child, label = "child process") {
	assert.equal(child.status, 0, `${label} failed:\n${child.stderr}`);
}

function runIsParallelAvailableCheck(home, extraEnv = {}) {
	return runWithHome(
		home,
		`const { isParallelAvailable } = await import(${JSON.stringify(parallelModuleUrl)});
console.log(String(isParallelAvailable()));`,
		extraEnv,
	);
}

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
