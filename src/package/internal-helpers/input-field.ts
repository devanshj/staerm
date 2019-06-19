import { ScreenText } from "./screen-text";
import { KeypressData } from "./../types";
import { toKeyname } from "../utils";

export class InputField {
    startPos = { x: 0, y: 0 };
    caretOffset: number = 0;
    length: number = 0;
    ownerScreenText: ScreenText | null = null;

    private contructor() {}
    static with(interopField: Pick<
        InputField,
        | "startPos"
        | "caretOffset"
        | "length"
        | "ownerScreenText"
    >): InputField {
        return Object.assign(new InputField(), interopField);
    }

    get currentPos() {
        let { startPos: { x, y }, caretOffset } = this;
        return { x: x + caretOffset, y }
    }
    get endPos() {
        let { startPos: { x, y }, length } = this;
        return { x: x + length, y }
    }

    
    get value() {
        if (!this.ownerScreenText) {
            throw "ownerScreenText is null";
        }

        return this.ownerScreenText.slice(this.startPos, this.endPos).value;
    }

    handlekeypress({ sequence }: KeypressData) {
        if (!this.ownerScreenText)
            return;

        if (JSON.stringify(sequence)[1] !== "\\") {
            let { currentPos } = this;
            this.ownerScreenText.splice(currentPos, 0, sequence);
            this.caretOffset++;
            this.length++;
        }


        let { caretOffset, length, currentPos } = this;
        let keyname = toKeyname(sequence);

        this.caretOffset = 
            keyname === "LEFT" || keyname === "BACKSPACE" ? Math.max(caretOffset - 1, 0) :
            keyname === "RIGHT" ? Math.min(caretOffset + 1, length) :
            keyname === "END" ? length :
            keyname === "HOME" ? 0 :
            caretOffset;

        if (keyname === "BACKSPACE") {
            if (caretOffset === 0) return;
            
            this.ownerScreenText.splice({
                ...currentPos,
                x: currentPos.x - 1
            }, 1)
            this.length--;
        }

        if (keyname === "DELETE") {
            if (caretOffset === length) return;

            this.ownerScreenText.splice(currentPos, 1)
            this.length--;
        }
    }

    isEqualTo(b: InputField) {
        let a = this;
        return (
            a.startPos.x === b.startPos.x &&
            a.startPos.y === b.startPos.y &&
            a.caretOffset === b.caretOffset &&
            a.length === b.length
        );
    }
}