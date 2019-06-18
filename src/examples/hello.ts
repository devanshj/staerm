import { setup } from "./node-recipe";

// using a little function so that you don't get distracted with initial setup
const { onKeypress, terminal } = setup();

// listen to every keypress to update the view
onKeypress(() => {

    // get name from text, remember `state.text` is the source of truth? ;)
    const getName = () => {
        let match = terminal.state.text.match(/What is your name\? (.*)/);
        return match ? match[1] : "";
    }
    let name = getName();

    terminal.state = {

        // set the text
        // much declarative huh? xD
        text: 
            `What is your name? ${name}\n` +
            (name !== ""
                ? `Hello, ${name}! :D`
                : ""),

        input:
            terminal.state.input === null
                // if there is no input being taken (which is the initial state)
                // take input at the specified position
                ? {
                    position: { y: 0, x: 19 },
                    caretOffset: 0,
                    value: ""
                }
                // else keep it as it is
                : terminal.state.input

        /* 
        The key thing here to notice is we are not getting the `name` from input.
        `state.input` is only to specify the current area of input (try pressing HOME & END keys ;P)
        `state.text` is name's source of truth even though you might feel `state.input` should be the source of truth
        */
    }
})