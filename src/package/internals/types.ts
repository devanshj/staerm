import { DeepReadonly } from "./utils";
import { ScreenText, InputField } from "./helpers";

export type Terminal = {
    state: {
        get: () => DeepReadonly<TerminalState>,
        set: (
            stateOrReducer:
                | TerminalState
                | ((state: DeepReadonly<TerminalState>) => TerminalState)
        ) => void,
        listen: (listener: TerminalStateListener) => void
    },
    io: {
        keypress: {
            emit: (data: KeypressData) => void,
            listen: (listener: KeypressListener) => void,
            middleware: {
                get: () => KeypressMiddleware,
                set: (middleware: KeypressMiddleware) => void
            }
        },
        stdout: {
            listen: (listener: StdoutListener) => void
        }
    }
};

export type TerminalState = {
    text: string,
    input: 
        | null
        | {
            position: {
                x: number,
                y: number
            },
            caretOffset: number,
            value: string
        }
}

export type InternalTerminalState = {
    text: ScreenText,
    inputField:
        | null
        | InputField
}

export type KeypressData = {
    sequence: string,
    ctrl: boolean,
    shift: boolean,
    meta: boolean
}
export type KeypressListener = (data: KeypressData) => void;
export type StdoutListener = (data: string) => void;
export type TerminalStateListener = (state: TerminalState) => void;
export type KeypressMiddleware = (data: KeypressData, emit: (data: KeypressData) => void) => void;




export type XtermTerminal = {
    write: (data: string) => void,
    on: (eventName: "key", listener: (key: string, event: KeyboardEvent) => void) => void
}

export type NodeJsProcess = {
    stdout: {
        write: (data: string) => void
    },
    stdin: {
        on: (
            eventName: "keypress",
            listener: (
                key: string,
                extra: {
                    sequence: string,
                    ctrl: boolean,
                    shift: boolean,
                    meta: boolean
                }
            ) => void
        ) => void
    },
    exit: () => void
}