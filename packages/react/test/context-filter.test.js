import test from "node:test";
import assert from "node:assert";
import { resolveFilter, isFilterAvailable } from "../src/context-filter.ts";

const OPTIONS = Object.freeze([
  {
    id: "All",
    label: "All",
    contexts: ["overland", "town", "field", "dungeon"],
  },
  { id: "RaceSpawns", label: "Race spawns", contexts: ["overland"] },
  {
    id: "TownMarks",
    label: "Town marks",
    contexts: ["overland", "town", "field"],
  },
  {
    id: "Monster",
    label: "Monsters",
    contexts: ["overland", "field", "dungeon"],
  },
]);

test("F-086: a filter valid in the context passes through unhealed", () => {
  assert.deepStrictEqual(resolveFilter("Monster", "dungeon", OPTIONS), {
    effective: "Monster",
    healed: false,
  });
});

test("F-086: an incompatible filter heals to the fallback and says why", () => {
  assert.deepStrictEqual(resolveFilter("RaceSpawns", "dungeon", OPTIONS), {
    effective: "All",
    healed: true,
    reason: "incompatible",
  });
  assert.deepStrictEqual(
    resolveFilter("Monster", "town", OPTIONS, "TownMarks"),
    {
      effective: "TownMarks",
      healed: true,
      reason: "incompatible",
    },
  );
});

test("F-086: an unknown filter id heals with reason unknown", () => {
  assert.deepStrictEqual(resolveFilter("Nope", "overland", OPTIONS), {
    effective: "All",
    healed: true,
    reason: "unknown",
  });
});

test("F-086: the requested filter and options are never mutated, so it can be restored on context exit", () => {
  const requested = "RaceSpawns";
  const healed = resolveFilter(requested, "dungeon", OPTIONS);
  assert.strictEqual(healed.effective, "All");
  assert.deepStrictEqual(resolveFilter(requested, "overland", OPTIONS), {
    effective: "RaceSpawns",
    healed: false,
  });
  assert.ok(Object.isFrozen(OPTIONS));
});

test("F-086: a fallback that is itself unavailable is a programmer error", () => {
  assert.throws(
    () => resolveFilter("RaceSpawns", "dungeon", OPTIONS, "TownMarks"),
    /fallback/,
  );
});

test("F-086: isFilterAvailable drives the disabled state of chips", () => {
  assert.strictEqual(
    isFilterAvailable("RaceSpawns", "overland", OPTIONS),
    true,
  );
  assert.strictEqual(isFilterAvailable("RaceSpawns", "field", OPTIONS), false);
  assert.strictEqual(isFilterAvailable("Nope", "field", OPTIONS), false);
});

test("F-086: context-filter.ts is byte-identical to the Svelte helper", async () => {
  const fs = await import("node:fs");
  const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
  assert.ok(
    read("../src/context-filter.ts") ===
      read("../../svelte/src/lib/context-filter.ts"),
    "context-filter.ts must not diverge",
  );
});
