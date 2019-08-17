export const toKeyname = (sequence: string) => 

	sequence === "\u001b[D"
		? "LEFT" :
	
	sequence === "\u001b[C"
		? "RIGHT" :

	sequence === "\b" || sequence === "\u007f" // \u007f for linux
		? "BACKSPACE" :

	sequence === "\u001b[3~"
		? "DELETE" :

	sequence === "\u001b[1~" || sequence === "\u001b[H" // \u001b[H for xterm.js
		? "HOME" :

	sequence === "\u001b[4~" || sequence === "\u001b[F" // \u001b[F for xterm.js
		? "END" :

	undefined;


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

export type DeepReadonly<T> = Readonly<{
	[K in keyof T]: Readonly<T[K]>
}>;