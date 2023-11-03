import { Grammar } from "./Grammar"
import { NonRecursivePredictiveParsingReturnType } from "./NonRecursivePredictiveParsingReturnType"

export type Computed = {
    grammar: Grammar | null,
    first: Record<string, string[]> | null,
    follow: Record<string, string[]> | null,
    parsingTable: Record<string, Record<string, string[]>> | null,
    nonRecursivePredictiveParsing: NonRecursivePredictiveParsingReturnType | null
}