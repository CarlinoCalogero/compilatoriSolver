export type NonRecursivePredictiveParsingReturnType = {
    matched: Record<number,string[]>,
    stack: Record<number,string[]>,
    input: Record<number,string[]>,
    output: Record<number,string[]>
}