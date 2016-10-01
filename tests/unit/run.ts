import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { getHelperStub } from '../support/testHelper';
import { Helper } from 'dojo-cli/interfaces';
import * as mockery from 'mockery';
import { stub, SinonStub } from 'sinon';

const projectPath = 'stubbed/path';
const compileStub: SinonStub = stub();
const pkgDirStub: SinonStub = stub();
const sysStub: SinonStub = stub();
const parseJsonConfigFileContentStub: SinonStub = stub();
const createCompilerHostStub: SinonStub = stub();

let consoleStub: SinonStub;
let helperStub: Helper;
let mockTsconfig = {
	compilerOptions: {}
};
let mockPackageJson = {};
let run: any;

registerSuite({
	name: 'run',
	'setup'() {
		mockery.enable({ 'warnOnUnregistered': false });
		mockery.registerMock('./compile', { 'default': compileStub });
		mockery.registerMock('pkg-dir', { 'sync': pkgDirStub });
		mockery.registerMock('typescript', {
			'sys': sysStub,
			'parseJsonConfigFileContent': parseJsonConfigFileContentStub,
			'createCompilerHost': createCompilerHostStub
		});
		mockery.registerMock('stubbed/path/tsconfig.json', mockTsconfig);
		mockery.registerMock('stubbed/path/package.json', mockPackageJson);

		consoleStub = stub(console, 'info');

		run = (<any> require('intern/dojo/node!./../../src/run')).default;
	},
	'teardown'() {
		consoleStub.restore();
		mockery.deregisterAll();
		mockery.disable();
	},
	'beforeEach'() {
		helperStub = getHelperStub<any>();
		compileStub.reset();
		pkgDirStub.reset();
		createCompilerHostStub.reset();
		parseJsonConfigFileContentStub.reset();
		sysStub.reset();
	},
	async 'Should throw an error if working directory could not be determined'() {
		pkgDirStub.returns(undefined);
		try {
			await run();
			assert.fail(null, null, 'Should throw error if unable to determine project directory.');
		}
		catch (err) {
			assert.isTrue(err instanceof Error);
			assert.equal(err.message, 'Unable to find project root, please ensure that you are in the correct directory.');
		}
	},
	async 'run with \'dev\' type correctly parses tsconfig and calls compile'() {
		const parsedConfig = {
			fileNames: [ 'file' ],
			options: {
				option: 'one'
			}
		};
		const compilerHost = 'compilerHost';

		pkgDirStub.returns(projectPath);
		parseJsonConfigFileContentStub.returns(parsedConfig);
		createCompilerHostStub.returns(compilerHost);

		await run(helperStub, { type: 'dev' });
		assert.isTrue(parseJsonConfigFileContentStub.calledWith(mockTsconfig, sysStub, projectPath, undefined, projectPath + '/tsconfig.json'));
		assert.isTrue(createCompilerHostStub.calledWith(parsedConfig.options));
		assert.isTrue(compileStub.calledWith(parsedConfig.fileNames, parsedConfig.options, compilerHost));
	},
	async 'run with \'dist\' type correctly parses tsconfig and calls compile'() {
		const parsedConfig = {
			fileNames: [ 'file' ],
			options: {
				option: 'one'
			}
		};
		const compilerHost = 'compilerHost';

		pkgDirStub.returns(projectPath);
		parseJsonConfigFileContentStub.returns(parsedConfig);
		createCompilerHostStub.returns(compilerHost);

		const distCompilerOptions = {
			outDir: 'dist/umd',
			declaration: true,
			sourceMap: true,
			inlineSources: true
		};
		const distExcludes = [ 'tests/**/*.ts' ];

		await run(helperStub, { type: 'dist' });
		assert.isTrue(
			parseJsonConfigFileContentStub.calledWith(
				{
					compilerOptions: distCompilerOptions,
					exclude: distExcludes
				},
				sysStub,
				projectPath,
				undefined,
				projectPath + '/tsconfig.json'
			)
		);

		assert.isTrue(createCompilerHostStub.calledWith(parsedConfig.options));
		assert.isTrue(compileStub.calledWith(parsedConfig.fileNames, parsedConfig.options, compilerHost));
	}
});
