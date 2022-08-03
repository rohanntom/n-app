import { given } from "@nivinjoseph/n-defensive";
import * as Path from "path";
import * as Fs from "fs";
import * as Zlib from "zlib";
import { Make } from "@nivinjoseph/n-util";


export class CompressStatic
{
    private readonly _rootDir: string;
    private readonly _extensions: ReadonlyArray<string>;


    public constructor(rootDir: string, ...extensions: ReadonlyArray<string>)
    {
        given(rootDir, "rootDir").ensureHasValue().ensureIsString()
            .ensure(t => Fs.statSync(Path.resolve(process.cwd(), t.trim())).isDirectory(), "not directory");

        this._rootDir = Path.resolve(process.cwd(), rootDir.trim());

        given(extensions, "extensions").ensureHasValue().ensureIsArray();
        this._extensions = extensions;
    }


    public async compress(): Promise<void>
    {
        const allFiles = this._traverseAccumulate(this._rootDir);

        await allFiles.forEachAsync(async (filePath) =>
        {
            const fileData = await Make.callbackToPromise<Buffer>(Fs.readFile)(filePath);
            const compressed = await Make.callbackToPromise<Buffer>(Zlib.brotliCompress)(fileData,
                { params: { [Zlib.constants.BROTLI_PARAM_MODE]: Zlib.constants.BROTLI_MODE_TEXT } });

            const compressedFilePath = Path.join(Path.dirname(filePath), Path.basename(filePath) + ".br");

            await Make.callbackToPromise(Fs.writeFile)(compressedFilePath, compressed);
        });
    }


    private _traverseAccumulate(dir: string): Array<string>
    {
        given(dir, "dir").ensureHasValue().ensureIsString()
            .ensure(t => Fs.statSync(t).isDirectory(), "not directory");

        return Fs.readdirSync(dir).reduce((acc, path) =>
        {
            path = Path.resolve(dir, path);
            if (Fs.statSync(path).isDirectory())
                acc.push(...this._traverseAccumulate(path));
            else if (this._extensions.isEmpty || this._extensions.contains(Path.extname(path)))
                acc.push(path);

            return acc;
        }, new Array<string>());
    }
}

const compressor = new CompressStatic("src/client/3rd-party/dist", ".js");
compressor
    .compress()
    .then(() => process.exit(0))
    .catch((e) =>
    {
        console.error(e);
        process.exit(1);
    });