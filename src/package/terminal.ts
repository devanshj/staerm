import { Terminal, TerminalState, KeypressListener, StdoutListener, TerminalStateListener } from "./types";
import { ansiEscapes, bindMethod, mergeFns } from "./utils";
import { i } from "./derivers";

export const terminal = (): Terminal => {

	let currentState = {
		text: "",
		input: null
	} as TerminalState;
	let prevState = currentState;

	const listeners = {
		keypress: [] as KeypressListener[],
		stdout: [] as StdoutListener[],
		state: [] as TerminalStateListener[]
	}

	const terminal: Terminal = {
		state: {
			get: () => currentState,
			set: state => {
				prevState = currentState;
				currentState = state;

				mergeFns(listeners.state)(currentState);
				if (!areStateEqual(currentState, prevState)) {
					mergeFns(listeners.stdout)(toStdout(currentState));
				}
			},
			reduce: reducer => terminal.state.set(reducer(currentState)),
			listen: bindMethod(listeners.state, "push")
		},
		io: {
			keypress: {
				emit: data => listeners.keypress.forEach(listener => listener(data)),
				listen: bindMethod(listeners.keypress, "push")
			},
			stdout: {
				listen: bindMethod(listeners.stdout, "push")
			}
		}
	};
	return terminal;
}

const toStdout =
	(state: TerminalState): string => 
		ansiEscapes.cursorMove(0, 0) + 
		ansiEscapes.clearScreen + 
		state.text +
		(state.input
			? ansiEscapes.cursorTo(...
				(({ x, y }) => [x, y] as [number, number])
				(i.currentPos(state.input))
			)
			: "");

const areStateEqual =
	(a: TerminalState, b: TerminalState) => 
		a.text === b.text && (
			a.input === b.input || (
				a.input !== null &&
				b.input !== null &&
				a.input.position.x === b.input.position.x &&
				a.input.position.y === b.input.position.y &&
				a.input.caretOffset === b.input.caretOffset &&
				a.input.length === b.input.length
			)
		)