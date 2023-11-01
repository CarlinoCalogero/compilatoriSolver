import { CheckSymbolGivenGrammarReturnType } from "./CheckSymbolGivenGrammarReturnType";

export type RecognizeSymbolReturnType = {
    checkSymbolGivenGrammarReturnType: CheckSymbolGivenGrammarReturnType,
    offset: number,
    isError: boolean
}
