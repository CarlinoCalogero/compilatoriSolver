import { Grammar } from "./Grammar"

export type TestType = {
    input: string,
    grammar: Grammar,
    first: Record<string, string[]>,
    follow: Record<string, string[]>
}