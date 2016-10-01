import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as mockery from 'mockery';
import * as chalk from 'chalk';
import { stub, SinonStub } from 'sinon';

const createProgramStub: SinonStub = stub();
const getPreEmitDiagnosticsStub: SinonStub = stub();
const flattenDiagnosticMessageTextStub: SinonStub = stub();

let consoleInfoStub: SinonStub;
let consoleErrorStub: SinonStub;
let compile: any;

registerSuite({
	name: 'main',
	'setup'() {
		mockery.enable({ 'warnOnUnregistered': false });
		mockery.registerMock('typescript', {
			'createProgram': createProgramStub,
			'getPreEmitDiagnostics': getPreEmitDiagnosticsStub,
			'flattenDiagnosticMessageText': flattenDiagnosticMessageTextStub
		});

		consoleInfoStub = stub(console, 'info');
		consoleErrorStub = stub(console, 'error');

		compile = (<any> require('intern/dojo/node!./../../src/compile')).default;
	},
	'teardown'() {
		consoleInfoStub.restore();
		consoleErrorStub.restore();
		mockery.deregisterAll();
		mockery.disable();
	},
	'beforeEach'() {
		consoleInfoStub.reset();
		consoleErrorStub.reset();
		flattenDiagnosticMessageTextStub.reset();
		createProgramStub.reset();
		getPreEmitDiagnosticsStub.reset();
	},
	'compile with no errors'() {
		const fileNames = 'fileNames';
		const options = 'options';
		const host = 'host';
		const mockProgram = {
			emit() {
				return {
					diagnostics: [],
					emitSkipped: false
				};
			}
		};

		createProgramStub.returns(mockProgram);
		getPreEmitDiagnosticsStub.withArgs(mockProgram).returns([]);

		compile(fileNames, options, host);
		assert.isTrue(createProgramStub.calledWith(fileNames, options, host));
		assert.isTrue(getPreEmitDiagnosticsStub.calledWith(mockProgram));
		assert.isTrue(consoleInfoStub.calledWith(chalk.green.bold('\nCompilation Completed')));
	},
	'compile throws an error when \'emitSkipped\' returns true'() {
		const fileNames = 'fileNames';
		const options = 'options';
		const host = 'host';
		const mockProgram = {
			emit() {
				return {
					diagnostics: [],
					emitSkipped: true
				};
			}
		};

		createProgramStub.returns(mockProgram);
		getPreEmitDiagnosticsStub.withArgs(mockProgram).returns([]);

		try {
			compile(fileNames, options, host);
		}
		catch (err) {
			assert.isTrue(err instanceof Error);
			assert.equal(err.message, 'Compilation Failed');
			assert.isTrue(createProgramStub.calledWith(fileNames, options, host));
			assert.isTrue(getPreEmitDiagnosticsStub.calledWith(mockProgram));
		}
	},
	'reports errors correctly that occur during compilation'() {
		const fileNames = 'fileNames';
		const options = 'options';
		const host = 'host';
		const mockProgram = {
			emit() {
				return {
					diagnostics: [{
						messageText: 'error message text',
						file: {
							fileName: 'file',
							getLineAndCharacterOfPosition() {
								return {
									line: 1,
									character: 1
								};
							}
						}
					}],
					emitSkipped: true
				};
			}
		};

		flattenDiagnosticMessageTextStub.returns('error message text');
		createProgramStub.returns(mockProgram);
		getPreEmitDiagnosticsStub.withArgs(mockProgram).returns([]);

		try {
			compile(fileNames, options, host);
		}
		catch (err) {
			assert.isTrue(err instanceof Error);
			assert.equal(err.message, 'Compilation Failed');
			assert.isTrue(createProgramStub.calledWith(fileNames, options, host));
			assert.isTrue(getPreEmitDiagnosticsStub.calledWith(mockProgram));
			assert.isTrue(flattenDiagnosticMessageTextStub.calledWith('error message text', '\n'));
			assert.isTrue(consoleErrorStub.calledWith(chalk.red('file (2,2): error message text')));
		}
	}
});
