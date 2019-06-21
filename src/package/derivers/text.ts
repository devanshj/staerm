const offsetAt =
	(
		text: string,
		{ x, y }: { x: number, y: number }
	) => 
		x + 
		text
		/* .split(/(?<=\n)/) lookbehind is not transpilable xD */
		.split("\n")
		.flatMap((x, i, xs) => 
			x === "" && i === xs.length - 1
				? []
				: [x + "\n"]
		)
		.slice(0, y)
		.reduce((a, s) => a + s.length, 0);

const slice =
	(
		text: string,
		start: { x: number, y: number },
		end: { x: number, y: number }
	) => 
		text.slice(
			offsetAt(text, start),
			offsetAt(text, end)
		);

const splice = 
	(
		text: string,
		start: { x: number, y: number },
		deleteOffset: number,
		insert: string = ""
	) => {
		let chars = text.split("");
		chars.splice(
			offsetAt(text, start) + (deleteOffset < 0 ? deleteOffset : 0),
			Math.abs(deleteOffset),
			...insert.split("")
		)
		return chars.join("");
	}

export const t = {
	offsetAt,
	slice,
	splice
}