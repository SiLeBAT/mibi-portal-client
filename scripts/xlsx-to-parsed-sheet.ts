/**
 * CLI: convert a BfR sample-sheet .xlsx into the `parsedSampleSheet` JSON that the
 * API expects since MPS-312.
 *
 * Why this lives in the client repo: since MPS-312 the browser is the ONLY place
 * that parses .xlsx — the server and the cloud no longer accept raw excel uploads
 * (see mibi-portal-server samples.controller `putSamplesTransformInput`). The
 * server's integration tests therefore need pre-generated JSON fixtures, and those
 * fixtures must come from the very same parser the browser uses. This script
 * instantiates `ExcelParserService` directly so there is exactly one implementation
 * of the excel -> JSON conversion.
 *
 * Usage (from the mibi-portal-client root):
 *
 *   npm run gen:parsed-sheet -- <input.xlsx> [output.json]
 *
 * With no output path the JSON is written next to the input, with a `.json`
 * extension. The emitted object is the bare ParsedSampleSheet; the API request body
 * wraps it as `{ "parsedSampleSheet": <this> }`.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ExcelParserService } from '../src/app/samples/excel/excel-parser.service';
import { ParsedSampleSheet } from '../src/app/samples/excel/excel-parser.model';

// The parser only ever touches `name` and `arrayBuffer()` on the File it is given,
// so a minimal stand-in is enough outside the browser (the unit test does the same).
function fileFromDisk(filePath: string): File {
    const buffer = fs.readFileSync(filePath);
    const arrayBuffer = async (): Promise<ArrayBuffer> => {
        await Promise.resolve();
        return buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
        ) as ArrayBuffer;
    };
    return {
        name: path.basename(filePath),
        arrayBuffer: arrayBuffer
    } as unknown as File;
}

async function main(): Promise<void> {
    const [input, output] = process.argv.slice(2);

    if (!input) {
        console.error(
            'usage: npm run gen:parsed-sheet -- <input.xlsx> [output.json]'
        );
        process.exit(1);
    }
    if (!fs.existsSync(input)) {
        console.error(`no such file: ${input}`);
        process.exit(1);
    }

    const target =
        output ?? path.join(path.dirname(input), path.parse(input).name + '.json');

    const parser = new ExcelParserService();
    const parsedSampleSheet: ParsedSampleSheet = await parser.parse(
        fileFromDisk(input)
    );

    fs.writeFileSync(
        target,
        JSON.stringify(parsedSampleSheet, null, 4) + '\n',
        'utf8'
    );

    console.log(
        `${input} -> ${target} ` +
            `(version ${parsedSampleSheet.meta.version}, ` +
            `${parsedSampleSheet.samples.length} samples)`
    );
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
