import { terminal, withNodeProcess, r } from "../package/";
import { emitKeypressEvents } from "readline";

process.stdin.setRawMode!(true);
emitKeypressEvents(process.stdin);

withNodeProcess(terminal(), process).reduce(
	r.pipe(
		r.typing,
		({ text, input }) => {
			let name = text.match(/What is your name\? (.*)/)?.[1] || "";

			return ({
				text: 
					`What is your name? ${name}\n` +
					(name !== "" ? `Hello, ${name}! :D` : ""),
				input:
					input || {
						position: { y: 0, x: 19 },
						caretOffset: 0,
						length: 0
					}
			})
		}
	)
);