"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressStatic = void 0;
const tslib_1 = require("tslib");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const Path = require("path");
const Fs = require("fs");
const Zlib = require("zlib");
const n_util_1 = require("@nivinjoseph/n-util");
class CompressStatic {
    constructor(rootDir, ...extensions) {
        (0, n_defensive_1.given)(rootDir, "rootDir").ensureHasValue().ensureIsString()
            .ensure(t => Fs.statSync(Path.resolve(process.cwd(), t.trim())).isDirectory(), "not directory");
        this._rootDir = Path.resolve(process.cwd(), rootDir.trim());
        (0, n_defensive_1.given)(extensions, "extensions").ensureHasValue().ensureIsArray();
        this._extensions = extensions;
    }
    compress() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const allFiles = this._traverseAccumulate(this._rootDir);
            yield allFiles.forEachAsync((filePath) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fileData = yield n_util_1.Make.callbackToPromise(Fs.readFile)(filePath);
                const compressed = yield n_util_1.Make.callbackToPromise(Zlib.brotliCompress)(fileData, { params: { [Zlib.constants.BROTLI_PARAM_MODE]: Zlib.constants.BROTLI_MODE_TEXT } });
                const compressedFilePath = Path.join(Path.dirname(filePath), Path.basename(filePath) + ".br");
                yield n_util_1.Make.callbackToPromise(Fs.writeFile)(compressedFilePath, compressed);
            }));
        });
    }
    _traverseAccumulate(dir) {
        (0, n_defensive_1.given)(dir, "dir").ensureHasValue().ensureIsString()
            .ensure(t => Fs.statSync(t).isDirectory(), "not directory");
        return Fs.readdirSync(dir).reduce((acc, path) => {
            path = Path.resolve(dir, path);
            if (Fs.statSync(path).isDirectory())
                acc.push(...this._traverseAccumulate(path));
            else if (this._extensions.isEmpty || this._extensions.contains(Path.extname(path)))
                acc.push(path);
            return acc;
        }, new Array());
    }
}
exports.CompressStatic = CompressStatic;
const compressor = new CompressStatic("src/client/3rd-party/dist", ".js");
compressor
    .compress()
    .then(() => process.exit(0))
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=compress-static.js.map