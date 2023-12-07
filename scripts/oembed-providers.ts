import { promisify } from "util";
import { fetch } from "popsicle";
import { join } from "path";
import * as fs from "fs";

const writeFile = promisify(fs.writeFile);

fetch("http://oembed.com/providers.json")
  .then((x) => x.json())
  .then((data) => {
    return writeFile(
      join(__dirname, "../vendor/providers.json"),
      JSON.stringify(data, null, 2),
    );
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
