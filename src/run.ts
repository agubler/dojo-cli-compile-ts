import { Argv } from 'yargs';
import { Helper } from 'dojo-cli/interfaces';
import * as ts from 'typescript';
import * as chalk from 'chalk';
import * as path from 'path';
import * as _ from 'lodash';
import compile from './compile';

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

export default async function(helper: Helper, args: CompilerArgs) {
	if (!workingDirectory) {
		throw new Error('Unable to find project root, please ensure that you are in the correct directory');
	}
	const tsconfigFile = path.join(workingDirectory, 'tsconfig.json');
	const packageJsonFile = path.join(workingDirectory, 'package.json');
	const tsconfig: any = require(tsconfigFile);
	const packageJson: any = require(packageJsonFile);
	const exclude = tsconfig.exclude || [];

	console.info(chalk.underline(`Compiling project ${packageJson.name}\n`));

	if (args.type) {
		_.merge(tsconfig.compilerOptions, distCompilerOptions);
		tsconfig.exclude = exclude.concat(distExcludes);
	}

	const configParseResult = ts.parseJsonConfigFileContent(tsconfig, ts.sys, workingDirectory, undefined, tsconfigFile);
	compile(configParseResult.fileNames, configParseResult.options, ts.createCompilerHost(configParseResult.options));
}
