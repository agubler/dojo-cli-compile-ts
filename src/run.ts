import { Argv } from 'yargs';
import { Helper } from 'dojo-cli/interfaces';
import * as ts from 'typescript';
import * as path from 'path';
import * as _ from 'lodash';

const pkgDir: any = require('pkg-dir');

const workingDirectory = pkgDir.sync(process.cwd());

const distCompilerOptions = {
	outDir: 'dist',
	declaration: true,
	sourceMap: true,
	inlineSources: true
};

const distExcludes = [ 'tests/**/*.ts' ];

export interface CompilerArgs extends Argv {
	type: 'dev' | 'dist';
}

function compile(fileNames: string[], options: ts.CompilerOptions, host: ts.CompilerHost): void {
	let program = ts.createProgram(fileNames, options, host);
	let emitResult = program.emit();

	let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	allDiagnostics.forEach(diagnostic => {
		let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
		let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
	});

	let exitCode = emitResult.emitSkipped ? 1 : 0;
	console.log(`Process exiting with code '${exitCode}'.`);
	process.exit(exitCode);
}

export default async function(helper: Helper, args: CompilerArgs) {
	const tsconfigFile = path.join(workingDirectory, 'tsconfig.json');
	const tsconfig: any = require(tsconfigFile);
	const exclude = tsconfig.exclude || [];

	if (args.type) {
		_.merge(tsconfig.compilerOptions, distCompilerOptions);
		tsconfig.exclude = exclude.concat(distExcludes);
	}

	const configParseResult = ts.parseJsonConfigFileContent(tsconfig, ts.sys, workingDirectory, undefined, tsconfigFile);
	compile(configParseResult.fileNames, configParseResult.options, ts.createCompilerHost(configParseResult.options));
}
