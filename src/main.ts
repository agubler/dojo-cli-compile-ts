import { Command } from 'dojo-cli/interfaces';
import register from './register';
import run from './run';

const command: Command = {
	description: 'Compiles TS projects, design for dojo2 package workflow',
	register,
	run
};

export default command;
