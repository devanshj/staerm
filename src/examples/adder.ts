import readline, { emitKeypressEvents } from "readline";
import { terminal } from "../package/";
import { KeypressData, KeypressListener, Terminal, KeypressMiddleware } from "../package/types";
import { withNodeProcess } from "../package/recipes";

class App {

    terminal: Terminal;
    constructor(terminal: Terminal){
        this.terminal = terminal;
        this.terminal.io.keypress.middleware.set(this.middleware);
        this.terminal.io.keypress.listen(this.onKeypress);
        this.render();
    }

    get a() {
        let matches = this.terminal.state.get().text.match(/a = (.*)/);
        if (matches) return matches[1] || "";
        return "";
    }

    get b() {
        let matches = this.terminal.state.get().text.match(/b = (.*)/);
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

    middleware: KeypressMiddleware = (data, emit) => {
        let { sequence } = data;

        if (
            Array.from(
                { length: 10 },
                (_, i) => i.toString()
            ).includes(sequence) ||
            JSON.stringify(sequence)[1] === "\\"
        ) {
            emit(data);
        }
    }

    currentInput: "a" | "b" = "a"
    nextRender = {
        shouldResetCaretOffset: false
    }
    

    get view() {
        return (
            `a = ${this.a}\n` +
            `b = ${this.b}\n` +
            (this.c
                ? `a + b = ${this.c}`
                : "")
        );
    }

    
    onKeypress: KeypressListener = ({ sequence }) => {
        if (sequence === "\u001b[A" || sequence === "\u001b[B" || sequence === "\r") {
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
        let { caretOffset: currentCaretOffset } = this.terminal.state.get().input || { caretOffset: 0 };
        let inputValue = this.currentInput === "a" ? this.a : this.b;
        let inputY = this.currentInput === "a" ? 0 : 1;

        this.terminal.state.set({
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
        })
    }
}

process.stdin.setRawMode!(true);
emitKeypressEvents(process.stdin);
new App(withNodeProcess(terminal(), process));

















