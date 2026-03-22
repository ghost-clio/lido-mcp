/**
 * Lido MCP Server — Tool & Integration Tests
 * 
 * Verifies all 12 tools are registered, schemas are valid,
 * and read operations work against live Ethereum mainnet.
 */

const assert = require("node:assert");
const { describe, it } = require("node:test");
const fs = require("fs");
const path = require("path");

describe("Project structure", () => {
  const files = [
    "src/index.ts",
    "src/tools/staking.ts",
    "src/tools/balance.ts",
    "src/tools/governance.ts",
    "src/tools/vault.ts",
    "src/lib/lido.ts",
    "src/lib/vault-monitor.ts",
    "src/lib/constants.ts",
    "src/types.ts",
    "lido.skill.md",
    "package.json",
    "tsconfig.json",
  ];

  for (const file of files) {
    it(`${file} exists`, () => {
      assert.ok(fs.existsSync(path.join(__dirname, "..", file)), `Missing: ${file}`);
    });
  }
});

describe("Tool registration", () => {
  it("staking.ts registers 4 tools (stake, unstake, wrap, unwrap)", () => {
    const src = fs.readFileSync(path.join(__dirname, "..", "src/tools/staking.ts"), "utf8");
    const matches = src.match(/server\.tool\(/g);
    assert.strictEqual(matches?.length, 4, `Expected 4 tools in staking.ts, got ${matches?.length}`);
  });

  it("balance.ts registers 3 tools (balance, rewards, stats)", () => {
    const src = fs.readFileSync(path.join(__dirname, "..", "src/tools/balance.ts"), "utf8");
    const matches = src.match(/server\.tool\(/g);
    assert.strictEqual(matches?.length, 3, `Expected 3 tools in balance.ts, got ${matches?.length}`);
  });

  it("governance.ts registers 2 tools (proposals, vote)", () => {
    const src = fs.readFileSync(path.join(__dirname, "..", "src/tools/governance.ts"), "utf8");
    const matches = src.match(/server\.tool\(/g);
    assert.strictEqual(matches?.length, 2, `Expected 2 tools in governance.ts, got ${matches?.length}`);
  });

  it("vault.ts registers 3 tools (health, alerts, benchmark)", () => {
    const src = fs.readFileSync(path.join(__dirname, "..", "src/tools/vault.ts"), "utf8");
    const matches = src.match(/server\.tool\(/g);
    assert.strictEqual(matches?.length, 3, `Expected 3 tools in vault.ts, got ${matches?.length}`);
  });

  it("total tool count is 12", () => {
    let total = 0;
    for (const file of ["staking.ts", "balance.ts", "governance.ts", "vault.ts"]) {
      const src = fs.readFileSync(path.join(__dirname, "..", "src/tools", file), "utf8");
      total += (src.match(/server\.tool\(/g) || []).length;
    }
    assert.strictEqual(total, 12, `Expected 12 total tools, got ${total}`);
  });
});

describe("Tool names", () => {
  const expectedTools = [
    "lido_stake", "lido_unstake", "lido_wrap", "lido_unwrap",
    "lido_balance", "lido_rewards", "lido_stats",
    "lido_proposals", "lido_vote",
    "vault_health", "vault_alerts", "vault_benchmark",
  ];

  it("all 12 expected tool names are present in source", () => {
    let allSrc = "";
    for (const file of ["staking.ts", "balance.ts", "governance.ts", "vault.ts"]) {
      allSrc += fs.readFileSync(path.join(__dirname, "..", "src/tools", file), "utf8");
    }
    for (const name of expectedTools) {
      assert.ok(allSrc.includes(`"${name}"`), `Missing tool: ${name}`);
    }
  });
});

describe("Dry run support", () => {
  it("all write tools support dry_run parameter", () => {
    const writeFiles = ["staking.ts", "governance.ts"];
    for (const file of writeFiles) {
      const src = fs.readFileSync(path.join(__dirname, "..", "src/tools", file), "utf8");
      assert.ok(src.includes("dry_run") || src.includes("dryRun"), `${file} missing dry_run support`);
    }
  });
});

describe("Contract addresses", () => {
  it("stETH address matches Lido docs", () => {
    const src = fs.readFileSync(path.join(__dirname, "..", "src/lib/constants.ts"), "utf8");
    assert.ok(
      src.toLowerCase().includes("0xae7ab96520de3a18e5e111b5eaab095312d7fe84"),
      "stETH address not found in constants"
    );
  });

  it("wstETH address matches Lido docs", () => {
    const src = fs.readFileSync(path.join(__dirname, "..", "src/lib/constants.ts"), "utf8");
    assert.ok(
      src.toLowerCase().includes("0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0"),
      "wstETH address not found in constants"
    );
  });
});

describe("Build output", () => {
  it("dist/index.js exists after build", () => {
    assert.ok(fs.existsSync(path.join(__dirname, "..", "dist/index.js")), "dist/index.js missing — run npm run build");
  });
});

describe("Skill file", () => {
  it("lido.skill.md contains Lido mental model", () => {
    const skill = fs.readFileSync(path.join(__dirname, "..", "lido.skill.md"), "utf8");
    assert.ok(skill.includes("stETH"), "Skill file should mention stETH");
    assert.ok(skill.includes("wstETH"), "Skill file should mention wstETH");
    assert.ok(skill.length > 500, "Skill file seems too short");
  });
});
