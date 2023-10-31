export type CheckSymbolFunctionReturnType = {
    nonTerminalSymbol: boolean,
    nonTerminalSymbolFollowedByApostrof: boolean,
    apostrophe: boolean,
    terminal: boolean,
    terminalFollowedByNonTerminalSymbol: boolean,
    terminalFollowedByNonTerminalSymbolWithAprostrophe: boolean,
    terminalFollowedByTerminalOrApostrophe: boolean,
    compoundTerminal: boolean,
    sumToIndex: number,
}
