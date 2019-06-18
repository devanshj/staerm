# staerm

## Principles

1. The state of terminal at any given point can be represented by a simple object with the type &ndash;

    ```typescript
    { text: string
    , input:
        | null
        | { position:
              { x: number
              , y: number
              }
          , caretOffset: number
          , value
          }
    }
    ```

2. The `state.text` is the (preferable) source of truth for all other internal app state. And optionally `state.input` but should be avoided if possible.

## What, why & usage

Will add soon, by the time look at `src/examples/hello.ts`
