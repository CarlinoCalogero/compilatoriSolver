import { ItemSet } from "./ItemSet"

export type AutomaLR0Row = {
    rowNumber: number,
    itemSet: ItemSet,
    otherColumns: Record<string, number[]>
}