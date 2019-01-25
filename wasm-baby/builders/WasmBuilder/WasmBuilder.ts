import { spawn, execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { WasmBuilderSchema } from './schema';

const EMSCRIPTEN = 'emcc.bat';

export default class WasmBuilder implements Builder<WasmBuilderSchema> {
    constructor(private context: BuilderContext) {
    }

    run(builderConfig: BuilderConfiguration<Partial<WasmBuilderSchema>>): Observable<BuildEvent> {
        return from(this.compile(builderConfig.options.inputFile, builderConfig.options.outputFile))
            .pipe(map(success => ({ success })));
    }

    private async compile(inputFile: string, outputFile: string): Promise<boolean> {
        const compilerPath = await this.getCompilerPath();
        console.log(`[WasmBuilder] Compiling ${inputFile} to ${outputFile}`);
        const compilationArguments = [
            `-o`, `${outputFile}`,
            `-s`, `WASM=1`,
            `${inputFile}`];
        const success = await this.executeCompiler(compilerPath, compilationArguments);
        return success;
    }

    private getCompilerPath(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const emscriptenBinaryDirectory = process.env['EMSCRIPTEN'];

            fs.access(emscriptenBinaryDirectory, (err) => {
                if (err) {
                    reject(`Compiler not be found. Looked at ${emscriptenBinaryDirectory}.
                     Make sure you installed and sourced Emscripten!`);
                } else {
                    resolve(path.join(emscriptenBinaryDirectory, EMSCRIPTEN));
                }
            });
        });
    }

    private executeCompiler(compilerPath, args: string[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const compileProcess = execFile(compilerPath, args, {env: process.env});

            compileProcess.stdout.on('data', (data) => {
                console.log(`[WasmBuilder] ${data}`);
            });

            compileProcess.stderr.on('data', (data) => {
                console.error(`[WasmBuilder] Error: ${data}`);
            });
            compileProcess.on('error', (err) => {
                console.error(`[WasmBuilder] Compilation failed: ${err}`);
                reject(err);
            });
            compileProcess.on('close', (code) => {
                const isSuccessful = +code === 0;
                if (isSuccessful) {
                    console.log(`[WasmBuilder] Done`);
                } else {
                    console.error(`[WasmBuilder] Compiler exited with ${code}`);
                }
                resolve(isSuccessful);
            });

        });
    }
}
