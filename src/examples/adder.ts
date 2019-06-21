import { terminal, withNodeProcess, r, TerminalState } from "../package/";
import { emitKeypressEvents } from "readline";

process.stdin.setRawMode!(true);
emitKeypressEvents(process.stdin);
const { state, io } = withNodeProcess(terminal(), process);

io.keypress.listen(key => {
	
	const getA = (text: string) => {
		let match = text.match(/a = (.*)/);
		return match ? match[1] : "";
	}

	const getB = (text: string) => {
		let match = text.match(/b = (.*)/);
		return match ? match[1] : "";
	}

	const getC = (text: string) => {
		let a = getA(text);
		let b = getB(text);

		return (
			a === "" || b === ""
			   ? ""
			   : Number(a) + Number(b)
		)
	}
	
	let { sequence } = key;
	state.reduce(state => 
		r.pipe(
			(!!sequence.match(/\d/) ||
			JSON.stringify(sequence)[1] === "\\")
				? r.typing
				: x => x,
			state => {
				let { text, input } = state;
				let a = getA(text);
				let b = getB(text);
				let c = getC(text);

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

						sequence === "\u001b[A" ||
						sequence === "\u001b[B" ||
						sequence === "\r"
							? (y => ({
								position: {
									y,
									x: 4
								},
								caretOffset: (y === 0 ? a : b).length,
								length: (y === 0 ? a : b).length
							}))(input.position.y === 0 ? 1 : 0) :

						input
				})
			}
		)(state, key)
	);
});

io.keypress.emit({
	sequence: "",
	ctrl: false,
	shift: false,
	meta: false
});