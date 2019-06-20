import { bindMethod, ansiEscapes } from "./utils";
import { ScreenText, InputField } from "./helpers";
import { Terminal, KeypressListener, StdoutListener, KeypressMiddleware, TerminalState, InternalTerminalState } from "./types";
import { writeFile } from "fs";


export const terminal = (): Terminal => {

    /* ---- */
    /* Internal State */

    const internalState: InternalTerminalState = {
        text: ScreenText.ofValue(""),
        inputField: null as InputField | null
    };
    let prevInternalState = internalState;

    let listeners = {
        keypress: [] as KeypressListener[],
        stdout: [] as StdoutListener[],
    }

    let _middleware: KeypressMiddleware = (data, emit) => emit(data);
    let middleware: Terminal["io"]["keypress"]["middleware"] = {
        get: () => _middleware,
        set: m => _middleware = m
    }

    /* ---- */
    /* Internal Effects */

    const internalRender = () => 
        shouldRender(internalState, prevInternalState) &&
        listeners.stdout.forEach(
            emitStdout => emitStdout(toStdout(internalState))
        );

    const internalOnKeypress: KeypressListener = data => {
        if (!internalState.inputField)
            return;

        internalState.inputField.handlekeypress(data);
        internalRender();

        listeners.keypress.forEach(
            emitKeypress => emitKeypress(data)
        );
    }

    const internalOnState = (state: TerminalState) => {
        Object.assign(
            internalState,
            toInternalState(state)
        );
        internalRender();
    }
    
    /* ---- */
    /* Main interface */

    const terminal: Terminal = {
        state: {
            get: () => Object.freeze({
                text: internalState.text.value,
                input:
                    internalState.inputField === null
                        ? null
                        : (
                            ({ startPos: position, caretOffset, value }) => 
                            Object.freeze({ position, caretOffset, value })
                        )(internalState.inputField)
            }),
            set: stateOrReducer =>
                internalOnState(
                    typeof stateOrReducer === "function"
                        ? stateOrReducer(terminal.state.get())
                        : stateOrReducer
                )
        },
        io: {
            keypress: {
                emit: data => middleware.get()(data, internalOnKeypress),
                listen: bindMethod(listeners.keypress, "push"),
                middleware
            },
            stdout: {
                listen: bindMethod(listeners.stdout, "push")
            }
        }
    };
    return terminal;
}

const toInternalState =
    (state: TerminalState): InternalTerminalState => {
        let text = ScreenText.ofValue(state.text);
        let inputField =
            state.input === null
                ? null
                : (({ position: startPos, caretOffset, value }) =>
                    InputField.with({
                        startPos,
                        caretOffset,
                        length: value.length,
                        ownerScreenText: text
                    })
                )(state.input);

        if (inputField) {
            let { startPos, length, value } = inputField
            text.splice(startPos, length, value);
        }

        return { text, inputField };
    }

const toStdout =
    (state: InternalTerminalState): string =>
        ansiEscapes.cursorMove(0, 0) + 
        ansiEscapes.clearScreen + 
        state.text.value +
        (state.inputField
            ? ansiEscapes.cursorTo(...
                (({ x, y }) => [x, y] as [number, number])
                (state.inputField.currentPos)
            )
            : "");

const shouldRender = (newState: InternalTerminalState, oldState: InternalTerminalState) =>
    (
        newState.text === oldState.text &&
        (
            (
                newState === null &&
                oldState === null
            ) || (
                newState.inputField &&
                oldState.inputField &&
                newState.inputField.isEqualTo(oldState.inputField)
            ) 
        )
    );