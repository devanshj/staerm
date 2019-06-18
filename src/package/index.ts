export default class Terminal {


    /* ================================================= */
    /* Public APIs */

    constructor({ keypressEmitter, stdoutListener }: {
        keypressEmitter:
            (listener: 
                (data: {
                    key: string,
                    ctrl: boolean,
                    shift: boolean,
                    meta: boolean
                }) => void
            ) => void,

        stdoutListener:
            (data: string) => void
    }) {
        this.stdoutListener = stdoutListener;    
        keypressEmitter(this.onKeypress.bind(this));
    }

    get state() {
        return Object.freeze({
            text: this.text.value,
            input:
                this.inputField === null
                    ? null
                    : (({ startPos, value, caretOffset }) => Object.freeze({
                        position: startPos,
                        caretOffset,
                        value
                    }))(this.inputField) 
        });
    }

    set state({ text, input }) {
        this.text.value = text;

        this.inputField =
            input === null
                ? null
                : (() => {
                    
                    let inputField = new InputField({
                        startPos: input.position,
                        caretOffset: input.caretOffset,
                        length: input.value.length,
                        ownerScreenText: this.text
                    })

                    this.text.splice(
                        inputField.startPos,
                        inputField.length,
                        input.value
                    );

                    return inputField;
                })();

        this.render();
    }

    






    /* ================================================= */
    /* Internals */

    /* ------------------------------------------------- */
    /* State */
    
    private text = new ScreenText();
    private inputField: InputField | null = null;



   
    /* ------------------------------------------------- */
    /* Events & Effects */

    private render() {
        this.emitStdout(
            Terminal.ansiEscapes.cursorMove(0, 0) + 
            Terminal.ansiEscapes.clearScreen + 
            this.text.value +
            (this.inputField
                ? Terminal.ansiEscapes.cursorTo(...
                    (({ x, y }) => [x, y] as [number, number])
                    (this.inputField.currentPos)
                )
                : "")
        )
    }

    private stdoutListener: (data: string) => void;
    private emitStdout(data: string) {
        this.stdoutListener(data);
    }
    
    private onKeypress({ key }: { key: string, ctrl?: boolean, shift?: boolean, meta?: boolean }) {
        if (!this.inputField)
            return;

        let oldText = this.text.value;

        if (JSON.stringify(key)[1] !== "\\") {
            let { currentPos } = this.inputField;
            this.text.splice(currentPos, 0, key);
            this.inputField.caretOffset++;
            this.inputField.length++;
        }


        let { caretOffset, length, currentPos } = this.inputField;
        let keyname = Terminal.toKeyname(key);

        this.inputField.caretOffset = 
            keyname === "LEFT" || keyname === "BACKSPACE" ? Math.max(caretOffset - 1, 0) :
            keyname === "RIGHT" ? Math.min(caretOffset + 1, length) :
            keyname === "END" ? length :
            keyname === "HOME" ? 0 :
            caretOffset;

        if (keyname === "BACKSPACE") {
            if (caretOffset === 0) return;
            
            this.text.splice({
                ...currentPos,
                x: currentPos.x - 1
            }, 1)
            this.inputField.length--;
        }

        if (keyname === "DELETE") {
            if (caretOffset === length) return;

            this.text.splice(currentPos, 1)
            this.inputField.length--;
        }

        let newText = this.text.value;
        if (newText !== oldText) {
            this.render();
        }
    }


    /* ------------------------------------------------- */
    /* Utils */

    private static toKeyname = (sequence: string) => {
        if (sequence === "\u001b[D") return "LEFT" as const;
        if (sequence === "\u001b[C") return "RIGHT" as const;
        if (sequence === "\b") return "BACKSPACE" as const;
        if (sequence === "\u001b[3~") return "DELETE" as const;
        if (
            sequence === "\u001b[1~" ||
            sequence === "\u001b[H" // for xterm.js
        ) return "HOME" as const;

        if (
            sequence === "\u001b[4~" ||
            sequence === "\u001b[F" // for xterm.js
        ) return "END" as const;
    }

    
    private static ansiEscapes = {
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
}


export class ScreenText {

    value: string;
    constructor(value = "") {
        this.value = value;
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
        return this.value.slice(
            this.offsetFor(start),
            this.offsetFor(end)
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
    }
}

class InputField {
    startPos = { x: 0, y: 0 };
    caretOffset: number = 0;
    length: number = 0;

    get currentPos() {
        let { startPos: { x, y }, caretOffset } = this;
        return { x: x + caretOffset, y }
    }
    get endPos() {
        let { startPos: { x, y }, length } = this;
        return { x: x + length, y }
    }

    ownerScreenText: ScreenText | null = null;
    get value() {
        if (!this.ownerScreenText) {
            throw "ownerScreenText is null";
        }

        return this.ownerScreenText.slice(this.startPos, this.endPos);
    }

    constructor(
        props:
            Partial<Pick<
                InputField,
                | "startPos"
                | "caretOffset"
                | "length"
                | "ownerScreenText"
            >> = {}
    ) {
        Object.assign(this, props);
    }
}