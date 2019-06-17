import Terminal from "./package";
import readline from "readline";

class App {
    
    get a() {
        let matches = this.terminal.state.text.match(/a = (.*)/);
        if (matches) return matches[1] || "";
        return "";
    }

    get b() {
        let matches = this.terminal.state.text.match(/b = (.*)/);
        if (matches) return matches[1] || "";
        return "";
    }

    get c() {
        return (
            this.a === "" || this.b === ""
               ? ""
                : Number(this.a) + Number(this.b)
        )
    }

    currentInput: "a" | "b" = "a"
    nextRender = {
        shouldResetCaretOffset: false
    }
    

    get view() {
        return (
            `a = ${this.a}\n` +
            `b = ${this.b}\n` +
            `a + b = ${this.c}`
        );
    }

    
    onKeypress(key: string) {
        if (key === "\u001b[A" || key === "\u001b[B" || key === "\r") {
            this.currentInput = 
                this.currentInput === "a"
                    ? "b"
                    : "a";
            
            this.nextRender.shouldResetCaretOffset = true;
        }

        
        this.render();
        this.nextRender.shouldResetCaretOffset = false;
    }

    render() {
        let { caretOffset: currentCaretOffset } = this.terminal.state.input || { caretOffset: 0 };
        let inputValue = this.currentInput === "a" ? this.a : this.b;
        let inputY = this.currentInput === "a" ? 0 : 1;

        this.terminal.state = {
            text: this.view,
            input: {
                position: {
                    x: 4,
                    y: inputY
                },
                caretOffset:
                    this.nextRender.shouldResetCaretOffset
                        ? inputValue.length
                        : currentCaretOffset,
                value: inputValue
            }
        }
    }

    terminal: Terminal;
    constructor() {
        process.stdin.setRawMode!(true);
        readline.emitKeypressEvents(process.stdin);

        this.terminal = new Terminal({
            stdoutListener: data => {
                process.stdout.write(data)
            },
            keypressEmitter: emitKeypress => {
                process.stdin.on("keypress", (_, { sequence, ctrl, shift, meta }) => {
                    if (ctrl && sequence == "\u0003")
                        process.exit();
                    
                    if (
                        Array.from(
                            { length: 10 },
                            (_, i) => i.toString()
                        ).includes(sequence) ||
                        JSON.stringify(sequence)[1] === "\\"
                    ) {
                        emitKeypress({ key: sequence, ctrl, shift, meta });
                        this.onKeypress(sequence)
                    }
                });
            }
        });

        this.render();
    }
}
new App();

















