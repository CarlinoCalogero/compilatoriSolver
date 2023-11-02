import { Grammar } from "./Grammar"

export type Computed = {
    grammar: Grammar | null,
    first: Record<string, string[]> | null,
    follow: Record<string, string[]> | null
}