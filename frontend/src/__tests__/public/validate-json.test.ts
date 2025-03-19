import { describe, it, assert, beforeAll } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { ScriptSchema, type Script } from "@/app/json-editor/_schemas/schemas";
import { Metadata } from "@/lib/types";
console.log('Current directory: ' + process.cwd());
const jsonDir = "public/json";
const metadataFileName = "metadata.json";
const versionsFileName = "versions.json";
const encoding = "utf-8";

const fileNames = (await fs.readdir(jsonDir))
  .filter((fileName) => fileName !== metadataFileName && fileName !== versionsFileName);

describe.each(fileNames)("%s", async (fileName) => {
  let script: Script;

  beforeAll(async () => {
    const filePath =  path.resolve(jsonDir, fileName);
    const fileContent = await fs.readFile(filePath, encoding)
    script = JSON.parse(fileContent);
  })


  it("should have valid json according to script schema", () => {
    ScriptSchema.parse(script);
  });

  it("should have a corresponding script file", () => {
    script.install_methods.forEach((method) => {
      const scriptPath = path.resolve("..", method.script)
      //FIXME: Dose note account for new dir structure and files in /script/tools

      assert(fs.stat(scriptPath), `Script file not found: ${scriptPath}`)
    })
  });
})

describe(`${metadataFileName}`, async () => {
  let metadata: Metadata;

  beforeAll(async () => {
    const filePath =  path.resolve(jsonDir, metadataFileName);
    const fileContent = await fs.readFile(filePath, encoding)
    metadata = JSON.parse(fileContent);
  })
  it("should have valid json according to metadata schema", () => {
    // TODO: create zod schema for metadata. Move zod schemas to /lib/types.ts
    assert(metadata.categories.length > 0);
    metadata.categories.forEach((category) => {
        assert.isString(category.name)
        assert.isNumber(category.id)
        assert.isNumber(category.sort_order)
    });
  });
})
