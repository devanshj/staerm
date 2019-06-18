import Terminal from "../package/";
import { emitKeypressEvents } from "readline";

export const setup = () => {
    process.stdin.setRawMode!(true);
    emitKeypressEvents(process.stdin);

    let listeners = {
        keypress: (key: string) => {}
    };
    const onKeypress = (listener: (key: string) => void) => {
        listeners.keypress = listener;
        listeners.keypress("");
    }

    return {
        terminal: new Terminal({
            stdoutListener: data => {
                process.stdout.write(data)
            },
            keypressEmitter: emitKeypress => {
                process.stdin.on("keypress", (_, { sequence, ctrl, shift, meta }) => {
                    if (ctrl && sequence == "\u0003")
                        process.exit();
                    
                    emitKeypress({ key: sequence, ctrl, shift, meta });
                    listeners.keypress(sequence);
                });
            }
        }),
        onKeypress
    }
}