export const toKeyname = (sequence: string) => {
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


type FunctionKeyof<T, P extends keyof T = keyof T> = {
    [K in P]: T[K] extends Function ? K : never;
}[P];

export const bindMethod =
    <T extends object>(stuff: T, method: FunctionKeyof<T>) =>
        (stuff[method] as unknown as Function).bind(stuff)

export type DeepReadonly<T> = Readonly<{
    [K in keyof T]: Readonly<T[K]>
}>;