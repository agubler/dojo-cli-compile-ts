import { Argv } from 'yargs';
import { Helper } from 'dojo-cli/interfaces';
import * as ts from 'typescript';
import * as chalk from 'chalk';
import * as path from 'path';
import * as _ from 'lodash';

const pkgDir: any = require('pkg-dir');

const workingDirectory = pkgDir.sync(process.cwd());

const distCompilerOptions = {
	outDir: 'dist/umd',
	declaration: true,
	sourceMap: true,
	inlineSources: true
};

const distExcludes = [ 'tests/**/*.ts' ];

export interface CompilerArgs extends Argv {
	type: 'dev' | 'dist';
}

function compile(fileNames: string[], options: ts.CompilerOptions, host: ts.CompilerHost): void {
	const program = ts.createProgram(fileNames, options, host);
	const emitResult = program.emit();
	const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	diagnostics.forEach(diagnostic => {
		const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
		const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		console.error(chalk.red(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`));
	});

	const exitCode = emitResult.emitSkipped || diagnostics.length ? 1 : 0;

	if (!exitCode) {
		console.info(chalk.green.bold('\nCompilation Completed'));
	}
	else {
		console.error(chalk.red.bold('\nCompilation Failed'));
	}

	process.exit(exitCode);
}

export default async function(helper: Helper, args: CompilerArgs) {
	const tsconfigFile = path.join(workingDirectory, 'tsconfig.json');
	const packageJsonFile = path.join(workingDirectory, 'package.json');
	const tsconfig: any = require(tsconfigFile);
	const packageJson: any = require(packageJsonFile);
	const exclude = tsconfig.exclude || [];

	if (args.type) {
		_.merge(tsconfig.compilerOptions, distCompilerOptions);
		tsconfig.exclude = exclude.concat(distExcludes);
	}

	const configParseResult = ts.parseJsonConfigFileContent(tsconfig, ts.sys, workingDirectory, undefined, tsconfigFile);
	console.info(chalk.underline(`Compiling project ${packageJson.name}\n`));
	compile(configParseResult.fileNames, configParseResult.options, ts.createCompilerHost(configParseResult.options));
}
