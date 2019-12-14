export const toKeyname = (sequence: string) =>
	use({
		"\u001B[A": "UP",
		"\u001B[B": "DOWN",
		"\u001b[D": "LEFT",
		"\u001b[C": "RIGHT",
		"\b": "BACKSPACE",
		"\u007f": "BACKSPACE",
		"\u001b[3~": "DELETE",
		"\u001b[1~": "HOME",
		"\u001b[H": "END",
		"\r": "ENTER"
	} as const)
	.as(sequences =>
		isIn(sequences, sequence)
			? sequences[sequence]
			: undefined
	);

const isIn =
	<O extends object>(o: O, k: keyof any): k is keyof O =>
		k in o;

export const ansiEscapes = {
	cursorMove:
		(x: number, y: number) =>
			(x < 0
				? "\u001B[" + (-x) + "D"
				: "\u001B[" + x + "C") +
			(y < 0
				? "\u001B[" + (-y) + "A"
				: "\u001B[" + y + "B"),

	clearScreen:
		"\u001Bc",
		
	cursorTo:
		(x: number, y: number) =>
			"\u001B[" + (y + 1) + ";" + (x + 1) + "H"
}


export const bindMethod =
	<T extends object, P extends keyof T = keyof T>(
		stuff: T,
		method: {
			[K in P]:
				T[K] extends Function
					? K
					: never;
		}[P]
	) =>
		(stuff[method] as unknown as Function).bind(stuff);

export const mergeFns =
	<A extends any[]>(fns: ((...args: A) => any)[]) =>
		(...args: A) => fns.forEach(fn => fn(...args));

export const use =
	<A extends any[]>(...a: A) =>
		({ as: <R>(f: (...a: A) => R) => f(...a) });

export type DeepReadonly<T> = Readonly<{
	[K in keyof T]: Readonly<T[K]>
}>;