import { typing } from "./typing";
import { TerminalState, KeypressData } from "../types";

export const r = {
	typing,
	pipe: (...rs: ((state: TerminalState, key: KeypressData) => TerminalState)[]) =>
		(state: TerminalState, key: KeypressData) =>
			rs.reduce((s, r) => r(s, key), state)
}