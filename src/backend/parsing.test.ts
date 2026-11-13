import { parseAvailability } from "./parsing";

const nullish = [null, undefined] as const;

describe("parseAvailability", () => {
  describe("plain JavaScript arrays", () => {
    it("parses a valid availability array", () => {
      expect(
        parseAvailability([
          [true, false],
          [false, true],
        ]),
      ).toEqual([
        [true, false],
        [false, true],
      ]);
    });

    it("parses an empty availability array", () => {
      expect(parseAvailability([])).toEqual([]);
    });

    it("parses empty columns", () => {
      expect(parseAvailability([[], [true], []])).toEqual([[], [true], []]);
    });

    it.each(nullish)(
      "replaces a top-level %p column with an empty array",
      (missingColumn) => {
        expect(
          parseAvailability([
            [true, false],
            missingColumn,
            [false, true],
          ]),
        ).toEqual([[true, false], [], [false, true]]);
      },
    );

    it.each(nullish)(
      "replaces a nested %p block with false",
      (missingBlock) => {
        expect(
          parseAvailability([
            [true, missingBlock, false],
            [missingBlock],
          ]),
        ).toEqual([
          [true, false, false],
          [false],
        ]);
      },
    );

    it("replaces sparse top-level array entries with empty arrays", () => {
      const value = [];
      value[0] = [true];
      value[2] = [false];

      expect(parseAvailability(value)).toEqual([[true], [], [false]]);
    });

    it("replaces sparse nested array entries with false", () => {
      const column = [];
      column[0] = true;
      column[2] = false;

      expect(parseAvailability([column])).toEqual([[true, false, false]]);
    });
  });

  describe("JSON-serialized arrays", () => {
    it("parses a JSON availability array", () => {
      expect(
        parseAvailability("[[true, false], [false, true]]"),
      ).toEqual([
        [true, false],
        [false, true],
      ]);
    });

    it("parses a JSON empty array", () => {
      expect(parseAvailability("[]")).toEqual([]);
    });

    it("replaces null JSON columns with empty arrays", () => {
      expect(
        parseAvailability("[[true, false], null, [false]]"),
      ).toEqual([[true, false], [], [false]]);
    });

    it("replaces null JSON blocks with false", () => {
      expect(
        parseAvailability("[[true, null, false], [null]]"),
      ).toEqual([
        [true, false, false],
        [false],
      ]);
    });

    it("handles JSON whitespace", () => {
      expect(parseAvailability(' \n [[true], null] \t')).toEqual([[true], []]);
    });
  });

  describe("invalid values", () => {
    it.each([
      ["invalid JSON", "{not valid JSON}"],
      ["a JSON object", '{"column":[true]}'],
      ["a JSON boolean", "true"],
      ["a JSON null", "null"],
      ["a JSON number", "42"],
      ["a plain string", "not JSON"],
      ["null", null],
      ["undefined", undefined],
      ["a number", 1],
      ["a boolean", true],
      ["an object", { 0: [true] }],
      ["a function", () => []],
    ])("returns undefined for %s", (_description, value) => {
      expect(parseAvailability(value)).toBeUndefined();
    });

    it.each([
      ["a top-level non-array column", [[true], true]],
      ["a top-level object column", [[true], {}]],
      ["a nested string", [[true, "false"]]],
      ["a nested number", [[true, 0]]],
      ["a nested object", [[true, {}]]],
      ["a nested array", [[true, [false]]]],
    ])("returns undefined for an array containing %s", (_description, value) => {
      expect(parseAvailability(value)).toBeUndefined();
    });
  });
});
