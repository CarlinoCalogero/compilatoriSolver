import { CheckSymbolFunctionReturnType } from "@/types/CheckSymbolFunctionReturnType";
import { CheckSymbolGivenGrammarReturnType } from "@/types/CheckSymbolGivenGrammarReturnType";
import { Grammar } from "@/types/Grammar";
import { RecognizeSymbolReturnType } from "@/types/RecognizeSymbolReturnType";

const endOfInputSymbol = "$";
const endOfStackSymbol = endOfInputSymbol;
const epsilon = "e";

/**
 * used in parseInput() function, given a symbol in input this function figures out which kind of symbol it is
 * @param nonTerminalSymbolsArray 
 * @param inputString 
 * @param currentSymbolIndex 
 * @returns 
 */
function figureOutSymbol(nonTerminalSymbolsArray: string[], inputString: string, currentSymbolIndex: number) {

    let returnValue: CheckSymbolFunctionReturnType = {
        nonTerminalSymbol: false,
        nonTerminalSymbolFollowedByApostrof: false,
        apostrophe: false,
        terminal: false,
        terminalFollowedByNonTerminalSymbol: false,
        terminalFollowedByNonTerminalSymbolWithAprostrophe: false,
        terminalFollowedByTerminalOrApostrophe: false,
        compoundTerminal: false,
        sumToIndex: 1
    }

    let currentSymbol = inputString[currentSymbolIndex];

    // currentSymbol is a nonTerminal
    if (nonTerminalSymbolsArray.includes(currentSymbol)) {

        if (currentSymbolIndex == inputString.length - 1 || (currentSymbolIndex < inputString.length - 1 && inputString[currentSymbolIndex + 1] != "'")) {
            // console.log("nonTerminal", currentSymbol);
            returnValue.nonTerminalSymbol = true;
            return returnValue;
        }

    }

    // currentSymbol is a nonTerminal followed by ' (e.g. A')
    if (currentSymbolIndex < inputString.length - 1 && inputString[currentSymbolIndex + 1] == "'") {
        // console.log("nonTerminalFollowedByApostrof", currentSymbol + "'");
        returnValue.nonTerminalSymbolFollowedByApostrof = true;
        returnValue.sumToIndex = 2;
        return returnValue;
    }

    // currentSymbol is '
    if (currentSymbol == "'") {
        // console.log("apostrof", currentSymbol);
        returnValue.apostrophe = true;
        return returnValue;
    }

    // current symbol is terminal
    // console.log("currentSymbolIndex", currentSymbolIndex, "length", inputString.length - 1)
    if (currentSymbolIndex < inputString.length - 1) {

        let responce = figureOutSymbol(nonTerminalSymbolsArray, inputString, currentSymbolIndex + 1);

        // nonTerminalSymbol
        if (responce.nonTerminalSymbol) {
            // console.log("_nonTerminalSymbol", inputString.substring(currentSymbolIndex, currentSymbolIndex + responce.sumToIndex + 1))
            returnValue.terminalFollowedByNonTerminalSymbol = true;
            // console.log("returnValue.sumToIndex", returnValue.sumToIndex)
            return returnValue
        }


        // nonTerminalSymbolFollowedByApostrof
        if (responce.nonTerminalSymbolFollowedByApostrof) {
            // console.log("_nonTerminalSymbolFollowedByApostrof", inputString.substring(currentSymbolIndex, currentSymbolIndex + responce.sumToIndex + 1))
            returnValue.terminalFollowedByNonTerminalSymbolWithAprostrophe = true;
            returnValue.sumToIndex = 2;
            // console.log("returnValue.sumToIndex", returnValue.sumToIndex)
            return returnValue
        }

        // terminalFollowedByNonTerminalSymbol
        if (responce.terminalFollowedByNonTerminalSymbol) {
            // console.log("_terminalFollowedByNonTerminalSymbol", inputString.substring(currentSymbolIndex, currentSymbolIndex + responce.sumToIndex + 1))
            returnValue.terminalFollowedByNonTerminalSymbol = true;
            returnValue.sumToIndex = returnValue.sumToIndex + responce.sumToIndex;
            // console.log("returnValue.sumToIndex", returnValue.sumToIndex)
            return returnValue
        }

        // terminalFollowedByNonTerminalSymbolWithAprostrophe
        if (responce.terminalFollowedByNonTerminalSymbolWithAprostrophe) {
            // console.log("_terminalFollowedByNonTerminalSymbolWithAprostrophe", inputString.substring(currentSymbolIndex, currentSymbolIndex + responce.sumToIndex + 1))
            returnValue.terminalFollowedByNonTerminalSymbolWithAprostrophe = true;
            returnValue.sumToIndex = returnValue.sumToIndex + responce.sumToIndex;
            // console.log("returnValue.sumToIndex", returnValue.sumToIndex)
            return returnValue
        }

        // terminals untile endOfInput
        if (responce.terminal) {
            // console.log("_terminalsUntilEndOfInput", inputString.substring(currentSymbolIndex, currentSymbolIndex + responce.sumToIndex + 1))
            returnValue.terminal = true;
            returnValue.sumToIndex = returnValue.sumToIndex + responce.sumToIndex;
            // console.log("returnValue.sumToIndex", returnValue.sumToIndex)
            return returnValue
        }

    }

    // currentSymbolIndex == inputString.length - 1
    // console.log("_terminal", currentSymbol)
    returnValue.terminal = true;
    return returnValue;

}

/**
 * used to parse input into a grammar
 * @param input 
 * @returns 
 */
export function parseInput(input: string) {

    // create grammar object
    let newGrammar: Grammar = {
        initialSymbol: '',
        nonTerminalSymbols: [],
        terminalSymbols: [],
        productions: {}
    }

    // remove spaces from text
    let parsedInput = input.replace(/ /g, '');

    // split productions
    let productionsArray = parsedInput.split('\n')

    if (productionsArray.length == 0)
        return newGrammar;

    /** get initial symbol */
    newGrammar.initialSymbol = productionsArray[0].substring(0, productionsArray[0].indexOf('='));

    /** get all nonTerminalSymbols */
    productionsArray.forEach(production => {

        let productionHead = production.substring(0, production.indexOf('='));

        if (!newGrammar.nonTerminalSymbols.includes(productionHead)) {
            newGrammar.nonTerminalSymbols.push(productionHead)
        }

        if (!(productionHead in newGrammar.productions)) {
            newGrammar.productions[productionHead] = [];
        }

    });

    /** get all possible terminal symbols */
    let possibleTerminalsArray: string[] = [];
    productionsArray.forEach(production => {

        // get the production head
        let productionHead = production.substring(0, production.indexOf('='));

        // get the production body
        let productionBody = production.substring(production.indexOf(">") + 1);

        // check if there is more then one body
        let productionBodyArray = productionBody.split('|');

        // check all production's bodies
        productionBodyArray.forEach(currentProductionBody => {

            newGrammar.productions[productionHead].push(currentProductionBody);

            let count = 0;
            while (count < currentProductionBody.length) {

                // check symbol
                let responce = figureOutSymbol(newGrammar.nonTerminalSymbols, currentProductionBody, count);

                // if symbol is a possible terminal push it into the array
                if (responce.terminal || responce.terminalFollowedByNonTerminalSymbol || responce.terminalFollowedByNonTerminalSymbolWithAprostrophe || responce.terminalFollowedByTerminalOrApostrophe) {
                    if (responce.sumToIndex == 1) { // if symbol is a terminal
                        possibleTerminalsArray.push(currentProductionBody[count]);
                    } else { // if symbol is a terminalFollowedByNonTerminalSymbol or a terminalFollowedByNonTerminalSymbolWithAprostrophe
                        possibleTerminalsArray.push(currentProductionBody.substring(count, count + responce.sumToIndex))
                    }
                }

                // increment counter
                count = count + responce.sumToIndex;

            }

        });

    });

    //** figure out what possible terminals are real terminals */
    let terminalLength = 1; // tells us the lenght of the terminals we are examining
    do {
        let leftOverTerminals: string[] = []; // used to reduce possibleTerminalsArray by populating it with terminals with lenght different from terminalLength
        // iterate over possible terminals
        for (let count = 0; count < possibleTerminalsArray.length; count++) {
            let currentPossibleTerminal = possibleTerminalsArray[count];

            //console.log("length", possibleTerminalsArray.length, "currentPossibleTerminal", currentPossibleTerminal)

            // we examine the possibile terminal only if the lenght is right
            if (currentPossibleTerminal.length == terminalLength) {

                // possible terminals made up only by one characters are terminals 100%
                if (terminalLength == 1 && !newGrammar.terminalSymbols.includes(currentPossibleTerminal)) {
                    newGrammar.terminalSymbols.push(currentPossibleTerminal)
                }

                // we now have to check if this terminal is made up by smaller terminals repeated or not
                if (terminalLength != 1 && !newGrammar.terminalSymbols.includes(currentPossibleTerminal)) {

                    let pattern = '-$%£_'

                    // iterate over our true terminals
                    newGrammar.terminalSymbols.forEach(terminalSymbol => {

                        // if possible terminal is made up by true terminals we replace these tre terminals in the string with a pattern
                        if (currentPossibleTerminal.includes(terminalSymbol)) {
                            currentPossibleTerminal = currentPossibleTerminal.replaceAll(terminalSymbol, pattern);
                        }

                    });

                    // we then get all substrings that were between true terminals
                    let newPossibleTerminalsArray = currentPossibleTerminal.split(pattern)
                    // the remaining possibile terminals are true terminals
                    // empty strings means there was a true terminal in that position
                    // empty string are not true terminals so we skip them
                    newPossibleTerminalsArray.forEach(possibleTerminalSymbol => {
                        if (possibleTerminalSymbol != '')
                            newGrammar.terminalSymbols.push(possibleTerminalSymbol)
                    });

                }

            } else {
                // get the possibile terminals that are longer than the current terminalLength
                leftOverTerminals.push(currentPossibleTerminal)
            }

        }

        // indirectly removes this round examined terminals
        possibleTerminalsArray = [...leftOverTerminals];
        // console.log(possibleTerminalsArray, terminalLength, newGrammar)
        // increases the considered terminalLength
        terminalLength++;
    } while (possibleTerminalsArray.length != 0)

    return newGrammar;
}

/**
 * first function main body
 * @param inputGrammar 
 */
export function first(inputGrammar: Grammar) {

    let first: Record<string, string[]> = {};

    for (const nonTerminalSymbol in inputGrammar.productions) {
        // call function on nonTerminalSymbol
        first[nonTerminalSymbol] = computeFirstEntry(inputGrammar, nonTerminalSymbol);
    }

    for (const terminalSymbol in inputGrammar.terminalSymbols) {
        // first of terminalSymbol is terminalSymbol
        first[inputGrammar.terminalSymbols[terminalSymbol]] = [inputGrammar.terminalSymbols[terminalSymbol]];
    }

    return first;

}

/**
 * computes first() function of nonTerminalSymbol
 * @param inputGrammar 
 * @param nonTerminalSymbol 
 * @returns 
 */
function computeFirstEntry(inputGrammar: Grammar, nonTerminalSymbol: string) {

    let firstRoughArray: string[] = [];

    // iterate over all production's bodies
    inputGrammar.productions[nonTerminalSymbol].forEach(productionBody => {
        // call the first() function of head with current productionBody
        firstRoughArray = [...firstRoughArray, ...getFirstEntry(inputGrammar, nonTerminalSymbol, productionBody)];
    });

    // removes duplicates
    return removeDuplicates(firstRoughArray);

}

/**
 * given an inputGrammar and a productionBody, it computes the first() function based on the productionBody
 * @param inputGrammar 
 * @param productionBody 
 * @returns 
 */
function getFirstEntry(inputGrammar: Grammar, productionHead: string, productionBody: string) {

    let responce = recognizeSymbol(inputGrammar, productionBody)

    if (responce.checkSymbolGivenGrammarReturnType.isTerminalSymbol) { // considered set of symbols is a terminalSymbol
        return [productionBody.substring(0, responce.offset)];
    }

    if (responce.checkSymbolGivenGrammarReturnType.isNonTerminalSymbol && productionHead == productionBody.substring(0, responce.offset)) { // handles if nonTerminalSymbol is equal to productionHead
        return []
    }

    if (responce.checkSymbolGivenGrammarReturnType.isNonTerminalSymbol) { // considered set of symbols is a nonTerminalSymbol
        // compute first() function of this nonTerminalSymbol (e.g. T => FE, we were computing first() function of T but now we compute first() function of F)
        return computeFirstEntry(inputGrammar, productionBody.substring(0, responce.offset));
    }

    // responce.isError
    // considered set of symbols is a neither a terminalSymbol nor nonTerminalSymbol -> this equals to Error
    console.log("Error")
    return []

}

/**
 * given a grammar and a symbol in input, check whether the symbol is
 * a terminal symbol, non terminal symbol or if it doesn't belong to the grammar at all
 * @param inputGrammar 
 * @param symbol 
 * @returns CheckSymbolGivenGrammarReturnType
 */
function checkSymbolGivenGrammar(inputGrammar: Grammar, symbol: string) {

    let checkSymbolGivenGrammarReturnType: CheckSymbolGivenGrammarReturnType = {
        isTerminalSymbol: false,
        isNonTerminalSymbol: false,
        isError: false
    }

    if (inputGrammar.nonTerminalSymbols.includes(symbol)) {
        // console.log(symbol, "nonTerminal");
        checkSymbolGivenGrammarReturnType.isNonTerminalSymbol = true;
        return checkSymbolGivenGrammarReturnType;
    }

    if (inputGrammar.terminalSymbols.includes(symbol)) {
        // console.log(symbol, "terminal");
        checkSymbolGivenGrammarReturnType.isTerminalSymbol = true;
        return checkSymbolGivenGrammarReturnType;
    }

    // console.log(symbol, "Error");
    checkSymbolGivenGrammarReturnType.isError = true;
    return checkSymbolGivenGrammarReturnType;

}

/**
 * removes duplicates from array
 * @param inputArray
 * @returns inputArray without duplicates
 */
function removeDuplicates(inputArray: string[]) {
    return inputArray.filter((item, index) => inputArray.indexOf(item) === index);
}

/**
 * given an input string, it considers characters of this input string until they match a terminalSymbol
 * or a non terminalSymbol. If even the whole input string does not match a terminalSymbol or a terminalSymbol, the function gives an error
 * @param inputGrammar 
 * @param inputString 
 * @returns 
 */
function recognizeSymbol(inputGrammar: Grammar, inputString: string) {

    let count = 0; // used to point which character of inputString is being considered
    // return value of this function
    let recognizeSymbolReturnType: RecognizeSymbolReturnType = {
        checkSymbolGivenGrammarReturnType: { // return value of checkSymbolGivenGrammar() function
            isTerminalSymbol: false,
            isNonTerminalSymbol: false,
            isError: false
        },
        offset: 0, // used to take substring from inputString
        isError: false
    };

    // iterates until a set of symbol is recognized as terminalSymbol or nonTerminalSymbol
    // or until the considered characters equals the inputString
    while (!recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType.isTerminalSymbol && !recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType.isNonTerminalSymbol && count < inputString.length) {

        recognizeSymbolReturnType.offset = count + 1; // increment considered characters

        if (inputString[count + 1] == '\'') { // handles nonTerminalSymbols followed by apostrophe (e.g. A')
            recognizeSymbolReturnType.offset = recognizeSymbolReturnType.offset + 1;
        }

        // console.log("substring", inputString.substring(0, offset))
        recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType = checkSymbolGivenGrammar(inputGrammar, inputString.substring(0, recognizeSymbolReturnType.offset)); // check if the considered set of symbols is a terminalSymbol or nonTerminalSymbol
        count++; // consider next character in inputString
    }

    // if considered characters were not recognized and they equals the inputString, that means that there is an error
    if (!recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType.isTerminalSymbol && !recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType.isNonTerminalSymbol && count == inputString.length) {
        recognizeSymbolReturnType.isError = true;
    }

    return recognizeSymbolReturnType;

}

/**
 * follow function main body
 * @param inputGrammar 
 * @param first 
 */
export function follow(inputGrammar: Grammar, first: Record<string, string[]>) {

    let follow: Record<string, string[]> = {}; // used to store the follow function output
    let linkedFollowEntries: Record<string, string[]> = {} // used to store the linked follow entries

    for (const nonTerminalSymbol in inputGrammar.productions) {
        // call function on nonTerminalSymbol
        follow[nonTerminalSymbol] = computeFollowEntry(inputGrammar, linkedFollowEntries, nonTerminalSymbol, first);
    }

    for (const terminalSymbol in inputGrammar.terminalSymbols) {
        // follow of terminalSymbol does not exist
        follow[inputGrammar.terminalSymbols[terminalSymbol]] = [];
    }

    console.log("follow", follow, "linkedFollowEntries", linkedFollowEntries)

}

/**
 * iterates over input nonTerminalSymbol productionBody and computes the follow function output
 * for the input nonTerminalSymbol
 * @param inputGrammar 
 * @param linkedFollowEntries 
 * @param nonTerminalSymbol 
 * @param first 
 * @returns 
 */
function computeFollowEntry(inputGrammar: Grammar, linkedFollowEntries: Record<string, string[]>, nonTerminalSymbol: string, first: Record<string, string[]>) {

    let followRoughArray: string[] = [];

    // iterate over all production's bodies
    inputGrammar.productions[nonTerminalSymbol].forEach(productionBody => {
        // call the first() function of head with current productionBody
        followRoughArray = [...followRoughArray, ...getFollowEntry(inputGrammar, linkedFollowEntries, nonTerminalSymbol, productionBody, first)];
    });

    // initialSymbol has endOfInputSymbol in its follow
    if (nonTerminalSymbol == inputGrammar.initialSymbol) {
        followRoughArray.push(endOfInputSymbol);
    }

    // removes duplicates
    return removeDuplicates(followRoughArray);

}

/**
 * given a productionBody in input, it parses this productionBody and computes the follow function output
 * @param inputGrammar 
 * @param linkedFollowEntries 
 * @param productionHead 
 * @param productionBody 
 * @param first 
 * @returns 
 */
function getFollowEntry(inputGrammar: Grammar, linkedFollowEntries: Record<string, string[]>, productionHead: string, productionBody: string, first: Record<string, string[]>) {


    let followArray: string[] = []; // used to store this productionHead follow entries

    while (productionBody.length != 0) {

        // recognize set of symbol
        let responce = recognizeSymbol(inputGrammar, productionBody)
        // get recognized set of symbols
        let recognizedSetOfSymbols = productionBody.substring(0, responce.offset);
        // remove recognizedSetOfSymbols from productionBody
        productionBody = productionBody.replace(recognizedSetOfSymbols, "");

        // if recognized set of symbols is a terminalSymbol do nothing
        if (!responce.checkSymbolGivenGrammarReturnType.isTerminalSymbol) {

            // if the new productionBody is "" then we call linkFollowsEntries() function
            if (productionBody == '') {
                linkFollowEntriesTogether(linkedFollowEntries, productionHead, recognizedSetOfSymbols)
            } else {

                // check what comes next of recognizedSetOfSymbols
                let symbolsNextToRecognizedSetOfSymbols = recognizeSymbol(inputGrammar, productionBody);

                // if the symbols next to recognized set of symbols is a terminal we add it to the followArray
                if (symbolsNextToRecognizedSetOfSymbols.checkSymbolGivenGrammarReturnType.isTerminalSymbol) {
                    followArray.push(recognizedSetOfSymbols)
                }

                // if the symbols next to recognized set of symbols is a nonTerminal symbol, everthing in 
                // First() of the symbols next to recognized set of symbols goes into the
                // Follow() of the recognized set of symbols
                if (symbolsNextToRecognizedSetOfSymbols.checkSymbolGivenGrammarReturnType.isNonTerminalSymbol) {

                    followArray = [...followArray, ...first[productionBody]]

                    // if the symbols next to recognized set of symbols is a nonTerminal symbol
                    // and this nonTerminal symbol has epsilon in its First()
                    // we call linkFollowEntriesTogether() function
                    if (first[productionBody].includes(epsilon))
                        linkFollowEntriesTogether(linkedFollowEntries, productionHead, recognizedSetOfSymbols);
                }

                // otherwise symbols next to recognized set of symbols were not recognized
                if (symbolsNextToRecognizedSetOfSymbols.isError) {
                    console.log("Error")
                }

            }


        }


    }

    return followArray;

}

/**
 * links together two followEnties
 * @param linkedFollowEntries 
 * @param productionHead 
 * @param nonTerminalSymbol 
 * @returns 
 */
function linkFollowEntriesTogether(linkedFollowEntries: Record<string, string[]>, productionHead: string, nonTerminalSymbol: string) {

    // do not link if productionHead equals the nonTerminalSymbol
    if (productionHead == nonTerminalSymbol)
        return;

    // if there was not a record initialize it
    if (!(productionHead in linkedFollowEntries))
        linkedFollowEntries[productionHead] = []

    // link two follow entries together if they are not already linked
    if (!linkedFollowEntries[productionHead].includes(nonTerminalSymbol))
        linkedFollowEntries[productionHead].push(nonTerminalSymbol)

}