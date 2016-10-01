import { Helper } from 'dojo-cli/interfaces';
import { Yargs } from 'yargs';

export default function(helper: Helper): Yargs {
	helper.yargs.option('t', {
		alias: 'type',
		describe: 'type of compilation',
		default: 'dev',
		choices: ['dev', 'dist' ]
	});

	return helper.yargs;
}
