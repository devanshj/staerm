import { terminal, withNodeProcess, r, toKeyname } from "../package/";
import { emitKeypressEvents } from "readline";

process.stdin.setRawMode!(true);
emitKeypressEvents(process.stdin);

withNodeProcess(terminal(), process).reduce(
	r.pipe(
		(state, key) =>
			(!!key.sequence.match(/\d/) ||
			JSON.stringify(key.sequence)[1] === "\\")
				? r.typing(state, key)
				: state,

		({ text, input }, { sequence }) => {

			let a = text.match(/a = (.*)/)?.[1] || "";
			let b = text.match(/b = (.*)/)?.[1] || "";
			let c = a !== "" && b !== "" ? a + b : "";

			return ({		
				text: 
					`a = ${a}\n` +
					`b = ${b}\n` +
					(c !== "" ? `c = ${c}` : ""),
		
				input:
					input === null
						? {
							position: {
								y: 0,
								x: 4
							},
							caretOffset: 0,
							length: 0
						} :

					["UP", "DOWN", "ENTER"].includes(toKeyname(sequence) || "")
						? use(input.position.y === 0 ? 1 : 0).as(y => ({
							position: {
								y,
								x: 4
							},
							caretOffset: (y === 0 ? a : b).length,
							length: (y === 0 ? a : b).length
						})) :

					input
			})
		}
	)
);

const use = <A extends any[]>(...a: A) =>
	({ as: <R>(f: (...a: A) => R) => f(...a) })