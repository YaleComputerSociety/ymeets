import { parseAvailability } from "./parsing";

const nullish = [null, undefined] as const;

describe("parseAvailability", () => {
  describe("on plain JavaScript arrays", () => {
    it("parses a valid 2x2", () => {
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

    it("parses an empty array", () => {
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

    it("replaces holes in sparse top-level arrays", () => {
      const value = [];
      value[0] = [true];
      value[2] = [false];

      expect(parseAvailability(value)).toEqual([[true], [], [false]]);
    });

    it("replaces holes in sparse nested array", () => {
      const column = [];
      column[0] = true;
      column[2] = false;

      expect(parseAvailability([column])).toEqual([[true, false, false]]);
    });
  });

  describe("on JSON-serialized arrays", () => {
    it("parses a valid array", () => {
      expect(
        parseAvailability("[[true, false], [false, true]]"),
      ).toEqual([
        [true, false],
        [false, true],
      ]);
    });

    it("parses an empty array", () => {
      expect(parseAvailability("[]")).toEqual([]);
    });

    it("replaces null columns with empty arrays", () => {
      expect(
        parseAvailability("[[true, false], null, [false]]"),
      ).toEqual([[true, false], [], [false]]);
    });

    it("replaces null blocks with false", () => {
      expect(
        parseAvailability("[[true, null, false], [null]]"),
      ).toEqual([
        [true, false, false],
        [false],
      ]);
    });

    it("handles whitespace", () => {
      expect(parseAvailability(' \n [[true], null] \t')).toEqual([[true], []]);
    });

    it("parses an older twice-stringified row after getParticipants' single parse", () => {
      const stored = JSON.stringify(JSON.stringify([[true, null], null]));
      // getParticipants runs JSON.parse once, leaving the inner JSON string
      expect(parseAvailability(JSON.parse(stored))).toEqual([[true, false], []]);
    });
  });

  describe("on invalid values", () => {
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
