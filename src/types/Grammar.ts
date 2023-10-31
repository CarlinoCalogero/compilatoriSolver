export type Grammar = {
    initialSymbol: string,
    nonTerminalSymbols: string[],
    terminalSymbols: string[],
    productions: Record<string, string[]>
}