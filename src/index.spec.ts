import { describe, it, expect } from "vitest";
import * as fs from "fs";
import { promisify } from "util";
import { Parser } from "htmlparser2";
import { join } from "path";
import { Handler } from "./index";

const readFile = promisify(fs.readFile);

const FIXTURE_DIR = join(__dirname, "../fixtures");
const FIXTURES = fs.readdirSync(FIXTURE_DIR);

describe("htmlmetaparser", () => {
  FIXTURES.forEach((name) => {
    it(name, async () => {
      const [html, meta] = await Promise.all([
        readFile(join(FIXTURE_DIR, name, "body.html"), "utf8"),
        readFile(join(FIXTURE_DIR, name, "meta.json"), "utf8").then(JSON.parse),
      ]);

      const handler = new Handler(
        (err, result) => {
          expect(err).toBeNull();
          expect(result).toMatchSnapshot();
        },
        {
          url: meta.url,
        },
      );

      const parser = new Parser(handler, { decodeEntities: true });
      parser.write(html);
      parser.end();
    });
  });
});
