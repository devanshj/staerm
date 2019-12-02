import { Terminal, XtermTerminal, NodeJsProcess } from "../types";
import { bindMethod } from "../utils";

export const withXterm = (terminal: Terminal, xterm: XtermTerminal): Terminal => {

	terminal.io.stdout.listen(
		data => xterm.write(
			data.replace(/\n/g, "\r\n") // xterm needs "\r" for line breaks
		)
	)

	xterm.on("key", (key, event) =>
		terminal.io.keypress.emit({
			sequence: event.keyCode === 8 ? "\b" : key, // xterm doesn't fire "\b"
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			meta: event.metaKey
		})
	)

	return terminal;
}

export const withNodeProcess = (terminal: Terminal, process: NodeJsProcess, exitOnCtrlC: boolean = true): Terminal => {
	terminal.io.stdout.listen(
		bindMethod(process.stdout, "write")
	)

	process.stdin.on("keypress", (_, data) => {
		if (exitOnCtrlC && data.ctrl && data.sequence == "\u0003")
			process.exit();
		
		terminal.io.keypress.emit(data);
	});

	return terminal;
}