import * as ts from 'typescript';
import * as chalk from 'chalk';

export default function(fileNames: string[], options: ts.CompilerOptions, host: ts.CompilerHost): void {
	const program = ts.createProgram(fileNames, options, host);
	const emitResult = program.emit();
	const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	diagnostics.forEach(diagnostic => {
		const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
		const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		console.error(chalk.red(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`));
	});

	const exitCode = emitResult.emitSkipped || diagnostics.length ? 1 : 0;

	if (exitCode) {
		throw new Error('Compilation Failed');
	}
}
