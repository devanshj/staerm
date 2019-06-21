import { terminal, withNodeProcess, r } from "../package/";
import { emitKeypressEvents } from "readline";
import { TerminalState } from "../package/types";

process.stdin.setRawMode!(true);
emitKeypressEvents(process.stdin);
const { state, io } = withNodeProcess(terminal(), process);

io.keypress.listen(key => {
	
	// get name from text, remember `state.text` is the source of truth? ;)
	const getName = (text: string) => {
		let match = text.match(/What is your name\? (.*)/);
		return match ? match[1] : "";
	}

	state.reduce(state => 
		r.pipe(
			r.typing, // a reducer that updates the state for you when the user is typing in an input
			state => {
				let name = getName(state.text);

				return ({		
					// set the text
					// much declarative huh? xD
					text: 
						`What is your name? ${name}\n` +
						(name !== ""
							? `Hello, ${name}! :D`
							: ""),
			
					input:
						state.input === null
							// if there is no input being taken (which is the initial state)
							// take input at the specified position
							? {
								position: { y: 0, x: 19 },
								caretOffset: 0,
								length: 0
							}
							// else keep it as it is
							: state.input
	  
					/*
					The key thing here to notice is we are not getting the `name` from input.
					`state.input` is only to specify the current area of input (try pressing HOME & END keys ;P)
					`state.text` is name's source of truth even though you might feel `state.input` should be the source of truth
					*/
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
// for initial render