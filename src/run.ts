import { Argv } from 'yargs';
import { Helper } from 'dojo-cli/interfaces';
import * as ts from 'typescript';
import * as chalk from 'chalk';
import * as path from 'path';
import * as _ from 'lodash';
import compile from './compile';

const pkgDir: any = require('pkg-dir');

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
	const workingDirectory = pkgDir.sync(process.cwd());
	if (!workingDirectory) {
		throw new Error('Unable to find project root, please ensure that you are in the correct directory.');
	}
	const tsconfigFile = path.join(workingDirectory, 'tsconfig.json');
	const packageJsonFile = path.join(workingDirectory, 'package.json');
	const tsconfig: any = require(tsconfigFile);
	const packageJson: any = require(packageJsonFile);

	console.info(chalk.underline(`Compiling project ${packageJson.name}\n`));

	if (args.type === 'dist') {
		_.merge(tsconfig.compilerOptions, distCompilerOptions);
		const exclude = tsconfig.exclude || [];
		tsconfig.exclude = exclude.concat(distExcludes);
	}

	const configParseResult = ts.parseJsonConfigFileContent(tsconfig, ts.sys, workingDirectory, undefined, tsconfigFile);
	const compilerHost = ts.createCompilerHost(configParseResult.options);
	compile(configParseResult.fileNames, configParseResult.options, compilerHost);
	console.info(chalk.green('succesfully compiled project'));
}
