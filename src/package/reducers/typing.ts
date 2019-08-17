import { TerminalState, KeypressData } from "../types";
import { toKeyname } from "../utils";
import { t, i } from "../derivers/";

export const typing = ({ text, input }: TerminalState, { sequence }: KeypressData): TerminalState =>
	input === null
		? ({ text, input }) :

	(({ key, isEscapeChar }) => 
		({
			text:
				!isEscapeChar
					? t.splice(text, i.currentPos(input), 0, sequence) :

				key === "BACKSPACE" && input.caretOffset !== 0
					? t.splice(text, i.currentPos(input), -1) :

				key === "DELETE" && input.caretOffset !== input.length
					? t.splice(text, i.currentPos(input), 1) :

				text,

			input: {
				position:
					input.position,

				caretOffset:
					!isEscapeChar
						? input.caretOffset + 1 :

					(key === "LEFT" || key === "BACKSPACE") && input.caretOffset !== 0
						? input.caretOffset - 1 :

					key === "RIGHT" && input.caretOffset !== input.length
						? input.caretOffset + 1 :

					key === "END"
						? input.length :

					key === "HOME"
						? 0 :

					input.caretOffset,

				length: 
					!isEscapeChar
						? input.length + 1 :

					(
						(key === "BACKSPACE" && input.caretOffset !== 0) ||
						(key === "DELETE" && input.caretOffset !== input.length)
					)
						? input.length - 1 :

					input.length
			}
		})
	)({
		key: toKeyname(sequence),
		isEscapeChar: /[^a-zA-Z0-9]/.test(sequence)
	});