import { TerminalState } from "../types";

type Input = NonNullable<TerminalState["input"]>

const startPos = 
	(input: Input) => input.position;

const currentPos =
	(input: Input) => ({
		x: input.position.x + input.caretOffset,
		y: input.position.y
	});

const endPos =
	(input: Input) => ({
		x: input.position.x + input.length,
		y: input.position.y
	});

export const i = {
	startPos,
	currentPos,
	endPos
}