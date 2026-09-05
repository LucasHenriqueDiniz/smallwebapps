import { describe, expect, it } from "vitest";
import {
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
} from "@/tools/case-converter/case";

// One string carrying every separator these functions treat differently: a
// space, a hyphen, an underscore, and a capital that is already in place.
const mixed = "Hello world-foo_bar";

describe("toTitleCase", () => {
  it("capitalizes the first letter of each whitespace-separated run and lowercases the rest", () => {
    expect(toTitleCase(mixed)).toBe("Hello World-foo_bar");
    expect(toTitleCase("HELLO WORLD")).toBe("Hello World");
  });
});

describe("toSentenceCase", () => {
  it("lowercases everything, then raises the first letter and the one after each sentence end", () => {
    expect(toSentenceCase(mixed)).toBe("Hello world-foo_bar");
    expect(toSentenceCase("hello there. how are you? fine!")).toBe("Hello there. How are you? Fine!");
  });

  it("raises the first word even when the string opens with whitespace", () => {
    expect(toSentenceCase("   hello world.")).toBe("   Hello world.");
  });
});

describe("toCamelCase", () => {
  it("treats space, hyphen and underscore alike as word breaks", () => {
    expect(toCamelCase(mixed)).toBe("helloWorldFooBar");
  });
});

describe("toPascalCase", () => {
  it("is camel case with the first letter raised", () => {
    expect(toPascalCase(mixed)).toBe("HelloWorldFooBar");
  });
});

describe("toSnakeCase", () => {
  it("turns whitespace into underscores and deletes every other separator", () => {
    // The hyphen is deleted rather than converted, so "world-foo" joins up.
    expect(toSnakeCase(mixed)).toBe("hello_worldfoo_bar");
  });
});

describe("toKebabCase", () => {
  it("turns whitespace into hyphens and deletes every other separator", () => {
    // Mirror image of snake case: here the underscore is the one deleted.
    expect(toKebabCase(mixed)).toBe("hello-world-foobar");
  });
});

describe("a second pass over already-converted output", () => {
  it.each([
    ["toTitleCase", toTitleCase],
    ["toSentenceCase", toSentenceCase],
    ["toSnakeCase", toSnakeCase],
    ["toKebabCase", toKebabCase],
  ])("leaves %s output alone", (_name, convert) => {
    const once = convert(mixed);
    expect(convert(once)).toBe(once);
  });

  it("collapses camel and pascal output, because both lowercase the input first", () => {
    // Not idempotent, and this pins it rather than claiming otherwise: the
    // lowercase pass erases the very humps the previous call inserted, and
    // nothing is left to mark the word breaks.
    expect(toCamelCase(toCamelCase(mixed))).toBe("helloworldfoobar");
    expect(toPascalCase(toPascalCase(mixed))).toBe("Helloworldfoobar");
  });
});
