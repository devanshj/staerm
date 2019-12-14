import { DeepReadonly } from "./utils";

export type Terminal = {
	state: {
		get: () => DeepReadonly<TerminalState>,
		set: (state: TerminalState) => void,
		reduce: (reducer: (state: TerminalState) => TerminalState) => void,
		listen: (listener: TerminalStateListener) => void
	},
	io: {
		keypress: {
			emit: (data: KeypressData) => void,
			listen: (listener: KeypressListener) => void
		},
		stdout: {
			listen: (listener: StdoutListener) => void
		}
	},
	reduce: (
		reducer: (
			state: TerminalState,
			keypressData: KeypressData
		) => TerminalState,
		initialState?: TerminalState
	) => void
};

export type TerminalState = {
	text: string,
	input: 
		| null
		| {
			position: {
				x: number,
				y: number
			},
			caretOffset: number,
			length: number
		}
}

export type KeypressData = {
	sequence: string,
	ctrl: boolean,
	shift: boolean,
	meta: boolean
}
export type KeypressListener = (data: KeypressData) => void;
export type StdoutListener = (data: string) => void;
export type TerminalStateListener = (state: TerminalState) => void;




export type XtermTerminal = {
	write: (data: string) => void,
	on: (eventName: "key", listener: (key: string, event: KeyboardEvent) => void) => void
}

export type NodeJsProcess = {
	stdout: {
		write: (data: string) => void
	},
	stdin: {
		on: (
			eventName: "keypress",
			listener: (
				key: string,
				extra: {
					sequence: string,
					ctrl: boolean,
					shift: boolean,
					meta: boolean
				}
			) => void
		) => void
	},
	exit: () => void
}