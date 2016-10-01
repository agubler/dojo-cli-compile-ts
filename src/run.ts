import * as ts from 'typescript';
import * as glob from 'glob';
import * as path from 'path';
import * as _ from 'lodash';

const pkgDir: any = require('pkg-dir');

const workingDirectory = pkgDir.sync(process.cwd());

function compile(fileNames: string[], options: ts.CompilerOptions): void {
	let program = ts.createProgram(fileNames, options);
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

function expandGlobs(globExpressions: string[]): Promise<string[][]> {
	const globOptions = {
		cwd: workingDirectory
	};

	return Promise.all(globExpressions.map((globExpression) => {
		return new Promise<string[]>((resolve, reject) => {
			glob(globExpression, globOptions, (err, files) => {
				if (err) {
					console.error('error', err);
					reject(err);
				}
				resolve(files);
			});
		});
	}));
}

async function run() {
	const tsConfig: any = require(path.join(workingDirectory, 'tsconfig.json'));
	const includeFiles = await expandGlobs(tsConfig.include || []);
	const excludeFiles = await expandGlobs(tsConfig.exclude || []);
	const compileFiles = _.difference(_.flatten(includeFiles), _.flatten(excludeFiles));

	compile(compileFiles, {
		noImplicitAny: true,
		target: ts.ScriptTarget.ES5, module: ts.ModuleKind.UMD,
		moduleResolution: ts.ModuleResolutionKind.NodeJs, outDir: '_build/'
	});
}

export default run;
