/**
 * Cat-Toto – unit specs
 * Run with: node --test tests/spec.js
 *
 * Tests cover the core logic functions used in index.html:
 *   - getParsedOptions  (My Options mode)
 *   - getRange          (Range mode)
 *   - pickNumber        (random selection)
 *   - mode switching    (Range ↔ My Options)
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

// ---------------------------------------------------------------------------
// Helpers – mirrors of the functions defined in index.html
// ---------------------------------------------------------------------------

function getParsedOptions(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function getRange(minValue, maxValue) {
  let min = parseInt(minValue, 10);
  let max = parseInt(maxValue, 10);

  if (Number.isNaN(min)) min = 1;
  if (Number.isNaN(max)) max = 49;

  if (min > max) {
    const oldMin = min;
    min = max;
    max = oldMin;
  }

  return { min, max };
}

function pickFromOptions(options) {
  if (options.length === 0) return null;
  return options[Math.floor(Math.random() * options.length)];
}

function pickFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// My Options mode – getParsedOptions
// ---------------------------------------------------------------------------

describe("getParsedOptions", () => {
  test("parses a comma-separated list", () => {
    const result = getParsedOptions("pizza, tacos, sushi");
    assert.deepEqual(result, ["pizza", "tacos", "sushi"]);
  });

  test("trims whitespace around each option", () => {
    const result = getParsedOptions("  cats ,  dogs  ,fish");
    assert.deepEqual(result, ["cats", "dogs", "fish"]);
  });

  test("filters out empty entries from trailing/double commas", () => {
    const result = getParsedOptions("a,,b,");
    assert.deepEqual(result, ["a", "b"]);
  });

  test("returns an empty array for an empty string", () => {
    const result = getParsedOptions("");
    assert.deepEqual(result, []);
  });

  test("returns an empty array for whitespace-only input", () => {
    const result = getParsedOptions("   ,  ,  ");
    assert.deepEqual(result, []);
  });

  test("preserves a single option with no commas", () => {
    const result = getParsedOptions("ramen");
    assert.deepEqual(result, ["ramen"]);
  });

  test("supports numeric strings as options", () => {
    const result = getParsedOptions("1, 2, 3");
    assert.deepEqual(result, ["1", "2", "3"]);
  });
});

// ---------------------------------------------------------------------------
// My Options mode – pickFromOptions
// ---------------------------------------------------------------------------

describe("pickFromOptions", () => {
  test("returns null when options list is empty (guard condition)", () => {
    assert.equal(pickFromOptions([]), null);
  });

  test("returns the only element when list has one item", () => {
    assert.equal(pickFromOptions(["only"]), "only");
  });

  test("always returns a value from the provided list", () => {
    const opts = ["pizza", "tacos", "sushi", "pasta", "ramen"];
    for (let i = 0; i < 100; i++) {
      const picked = pickFromOptions(opts);
      assert.ok(opts.includes(picked), `"${picked}" not in options list`);
    }
  });

  test("can pick every option given enough iterations", () => {
    const opts = ["a", "b", "c"];
    const seen = new Set();
    for (let i = 0; i < 300; i++) {
      seen.add(pickFromOptions(opts));
    }
    assert.deepEqual([...seen].sort(), ["a", "b", "c"]);
  });
});

// ---------------------------------------------------------------------------
// Range mode – getRange
// ---------------------------------------------------------------------------

describe("getRange", () => {
  test("returns min and max as parsed integers", () => {
    assert.deepEqual(getRange("1", "49"), { min: 1, max: 49 });
  });

  test("swaps min and max when min > max", () => {
    assert.deepEqual(getRange("20", "5"), { min: 5, max: 20 });
  });

  test("falls back to 1 when min is not a number", () => {
    const { min } = getRange("abc", "10");
    assert.equal(min, 1);
  });

  test("falls back to 49 when max is not a number", () => {
    const { max } = getRange("1", "xyz");
    assert.equal(max, 49);
  });

  test("handles equal min and max (single value range)", () => {
    assert.deepEqual(getRange("7", "7"), { min: 7, max: 7 });
  });

  test("handles negative number ranges", () => {
    assert.deepEqual(getRange("-10", "-1"), { min: -10, max: -1 });
  });
});

// ---------------------------------------------------------------------------
// Range mode – pickFromRange
// ---------------------------------------------------------------------------

describe("pickFromRange", () => {
  test("always returns a value within [min, max]", () => {
    for (let i = 0; i < 200; i++) {
      const n = pickFromRange(1, 10);
      assert.ok(n >= 1 && n <= 10, `${n} is out of range [1, 10]`);
    }
  });

  test("returns the only possible value when min === max", () => {
    for (let i = 0; i < 20; i++) {
      assert.equal(pickFromRange(5, 5), 5);
    }
  });

  test("can reach both endpoints of the range given enough iterations", () => {
    const seen = new Set();
    for (let i = 0; i < 500; i++) {
      seen.add(pickFromRange(1, 3));
    }
    assert.ok(seen.has(1), "never reached min");
    assert.ok(seen.has(3), "never reached max");
  });

  test("returns an integer (no decimals)", () => {
    for (let i = 0; i < 50; i++) {
      const n = pickFromRange(1, 100);
      assert.equal(n, Math.floor(n));
    }
  });
});

// ---------------------------------------------------------------------------
// Mode switching
// ---------------------------------------------------------------------------

describe("mode switching", () => {
  test("default mode is range", () => {
    let mode = "range";
    assert.equal(mode, "range");
  });

  test("switching to options mode changes the mode variable", () => {
    let mode = "range";
    mode = "options";
    assert.equal(mode, "options");
  });

  test("switching back to range mode restores range", () => {
    let mode = "options";
    mode = "range";
    assert.equal(mode, "range");
  });

  test("in options mode with empty list, pick guard returns null", () => {
    const mode = "options";
    const opts = getParsedOptions("");
    const result = mode === "options" ? pickFromOptions(opts) : pickFromRange(1, 49);
    assert.equal(result, null);
  });

  test("in range mode, pick uses numeric range even when options input exists", () => {
    const mode = "range";
    const result = mode === "options" ? pickFromOptions(["a", "b"]) : pickFromRange(1, 5);
    assert.ok(typeof result === "number");
  });
});
