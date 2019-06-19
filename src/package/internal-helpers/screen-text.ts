export class ScreenText {

    value: string = "";
    private constructor() {}
    static ofValue(value: string) {
        const text = new ScreenText();
        text.value = value;
        return text;
    }
    
    offsetFor({ x, y }: { x: number, y: number }) {
        return (
            x + 
            this.value
            /* .split(/(?<=\n)/) lookbehind is not transpilable xD */
            .split("\n")
            .flatMap((x, i, xs) => 
                x === "" && i === xs.length - 1
                    ? []
                    : [x + "\n"]
            )
            .slice(0, y)
            .reduce((a, s) => a + s.length, 0)
        )
    }

    slice(start: { x: number, y: number }, end: { x: number, y: number }) {
        return ScreenText.ofValue(
            this.value.slice(
                this.offsetFor(start),
                this.offsetFor(end)
            )
        );
    }

    splice(start: { x: number, y: number }, deleteLength: number = 0, insert: string = "") {
        let chars = this.value.split("");
        chars.splice(
            this.offsetFor(start),
            deleteLength,
            ...insert.split("")
        )
        this.value = chars.join("");
        return this;
    }
}