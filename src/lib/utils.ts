import { CheckSymbolFunctionReturnType } from "@/types/CheckSymbolFunctionReturnType";
import { CheckSymbolGivenGrammarReturnType } from "@/types/CheckSymbolGivenGrammarReturnType";
import { Grammar } from "@/types/Grammar";
import { RecognizeSymbolReturnType } from "@/types/RecognizeSymbolReturnType";
import { TestType } from "@/types/TestType";

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
            returnValue.sumToIndex = 3;
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
                // or by nonTerminals repeated or not
                if (terminalLength != 1 && !newGrammar.terminalSymbols.includes(currentPossibleTerminal)) {

                    let pattern = '-$%£_'

                    /** find out if this terminal is made up by smaller terminals repeated or not */
                    // iterate over our true terminals
                    newGrammar.terminalSymbols.forEach(terminalSymbol => {

                        // if possible terminal is made up by true terminals we replace these tre terminals in the string with a pattern
                        if (currentPossibleTerminal.includes(terminalSymbol)) {
                            currentPossibleTerminal = currentPossibleTerminal.replaceAll(terminalSymbol, pattern);
                        }

                    });

                    /** find out if this terminal is made up by smaller nonTerminals repeated or not */
                    // iterate over nonTerminals
                    newGrammar.nonTerminalSymbols.forEach(nonTerminalSymbol => {

                        // if possible terminal is made up by nonTerminals we replace these nonTerminals in the string with a pattern
                        // first check if nonTerminal followed by apostrophe (e.g A') is included
                        if (currentPossibleTerminal.includes(`${nonTerminalSymbol}\'`)) {
                            currentPossibleTerminal = currentPossibleTerminal.replaceAll(`${nonTerminalSymbol}\'`, pattern);
                        }

                        // if nonTerminal followed by apostrophe (e.g A') is not included
                        // then proceed normally
                        if (currentPossibleTerminal.includes(nonTerminalSymbol)) {
                            currentPossibleTerminal = currentPossibleTerminal.replaceAll(nonTerminalSymbol, pattern);
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

    // console.log("newGrammar", newGrammar)
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
        let currentTerminal = inputGrammar.terminalSymbols[terminalSymbol]; // get currentTerminal symbol
        // if currentTerminal symbol is epsilon skip it
        if (currentTerminal != epsilon)
            // first of terminalSymbol is terminalSymbol
            first[currentTerminal] = [currentTerminal];
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

        // console.log("substring", inputString.substring(0, recognizeSymbolReturnType.offset))
        recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType = checkSymbolGivenGrammar(inputGrammar, inputString.substring(0, recognizeSymbolReturnType.offset)); // check if the considered set of symbols is a terminalSymbol or nonTerminalSymbol
        // console.log("checkSymbolGivenGrammarReturnType", JSON.parse(JSON.stringify(recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType)))
        count++; // consider next character in inputString
    }

    // if considered characters were not recognized and they equals the inputString, that means that there is an error
    if (!recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType.isTerminalSymbol && !recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType.isNonTerminalSymbol && count == inputString.length) {
        recognizeSymbolReturnType.isError = true;
    }

    // console.log("_checkSymbolGivenGrammarReturnType", JSON.parse(JSON.stringify(recognizeSymbolReturnType.checkSymbolGivenGrammarReturnType)))

    return recognizeSymbolReturnType;

}

/**
 * follow function
 * @param inputGrammar 
 * @param first 
 */
export function follow(inputGrammar: Grammar, first: Record<string, string[]>) {

    let follow: Record<string, string[]> = {}; // used to store the follow function output
    let linkedFollowEntries: Record<string, string[]> = {} // used to store the linked follow entries

    // initialSymbol has endOfInputSymbol in its follow
    addArrayElementsInObjectAttribute(follow, inputGrammar.initialSymbol, [endOfInputSymbol]);

    // iterate all productions
    for (const nonTerminalSymbol in inputGrammar.productions) {

        // iterate over all production's bodies
        inputGrammar.productions[nonTerminalSymbol].forEach(productionBody => {

            // console.log("productionBody", productionBody, "\nfollow", JSON.parse(JSON.stringify(follow)))

            while (productionBody.length != 0) {

                // recognize set of symbol
                let responce = recognizeSymbol(inputGrammar, productionBody)
                // get recognized set of symbols
                let recognizedSetOfSymbols = productionBody.substring(0, responce.offset);
                // remove recognizedSetOfSymbols from productionBody
                productionBody = productionBody.replace(recognizedSetOfSymbols, "");

                // console.log("recognizedSetOfSymbols", recognizedSetOfSymbols, "next", productionBody)

                // if recognized set of symbols is a terminalSymbol do nothing
                if (!responce.checkSymbolGivenGrammarReturnType.isTerminalSymbol) {

                    // if the new productionBody is "" then we reached the end of the productionBody
                    if (productionBody == '') {
                        // we call linkFollowsEntries() function only if the recognized set of symbols is a nonTerminalSymbol
                        if (responce.checkSymbolGivenGrammarReturnType.isNonTerminalSymbol)
                            linkFollowEntriesTogether(linkedFollowEntries, nonTerminalSymbol, recognizedSetOfSymbols)
                    } else {

                        // check what comes next of recognizedSetOfSymbols
                        let symbolsNextToRecognizedSetOfSymbols = recognizeSymbol(inputGrammar, productionBody);

                        // get only the "first" next set of characters
                        let firstSetOfCharactersNextToRecognizedSetOfSymbols = productionBody.substring(0, symbolsNextToRecognizedSetOfSymbols.offset)

                        // console.log("firstSetOfCharactersNextToRecognizedSetOfSymbols", firstSetOfCharactersNextToRecognizedSetOfSymbols)

                        // if the symbols next to recognized set of symbols is a terminal we add it to the followArray
                        if (symbolsNextToRecognizedSetOfSymbols.checkSymbolGivenGrammarReturnType.isTerminalSymbol) {
                            // console.log("_terminal", firstSetOfCharactersNextToRecognizedSetOfSymbols, "recognizedSetOfSymbols", recognizedSetOfSymbols)
                            addArrayElementsInObjectAttribute(follow, recognizedSetOfSymbols, [firstSetOfCharactersNextToRecognizedSetOfSymbols]);
                        }

                        // if the symbols next to recognized set of symbols is a nonTerminal symbol, everthing in 
                        // First() of the symbols next to recognized set of symbols goes into the
                        // Follow() of the recognized set of symbols
                        if (symbolsNextToRecognizedSetOfSymbols.checkSymbolGivenGrammarReturnType.isNonTerminalSymbol) {

                            // console.log("_nonTerminal", firstSetOfCharactersNextToRecognizedSetOfSymbols, "recognizedSetOfSymbols", recognizedSetOfSymbols)
                            addArrayElementsInObjectAttribute(follow, recognizedSetOfSymbols, first[firstSetOfCharactersNextToRecognizedSetOfSymbols]);

                            // if the symbols next to recognized set of symbols is a nonTerminal symbol
                            // and this nonTerminal symbol has epsilon in its First()
                            // we call linkFollowEntriesTogether() function
                            if (first[firstSetOfCharactersNextToRecognizedSetOfSymbols].includes(epsilon))
                                linkFollowEntriesTogether(linkedFollowEntries, nonTerminalSymbol, recognizedSetOfSymbols);
                        }

                        // otherwise symbols next to recognized set of symbols were not recognized
                        if (symbolsNextToRecognizedSetOfSymbols.isError) {
                            console.log("Error")
                        }

                    }


                }


            }

        });

    }

    // console.log("linkedFollowEntries", JSON.parse(JSON.stringify(linkedFollowEntries)), "\nfollow", JSON.parse(JSON.stringify(follow)))

    /** put Follow() inside Follow() */
    let isWereElementsAddedToAFollow: boolean = true;
    // iterate until no more elements are added inside a follow
    do {

        // get number of follow entries elements before putting follow inside follow
        let numberOfElementsBeforeIteration = getNumberOfElementsOfFollowFunction(inputGrammar, follow);

        // put follow inside follow
        for (const senderSymbol in linkedFollowEntries) {

            linkedFollowEntries[senderSymbol].forEach(receiverSymbol => {
                addArrayElementsInObjectAttribute(follow, receiverSymbol, follow[senderSymbol]);
            });

        }

        // get number of follow entries elements after putting follow inside follow
        let numberOfElementsAfterIteration = getNumberOfElementsOfFollowFunction(inputGrammar, follow);

        // console.log("numberOfElementsBeforeIteration", JSON.parse(JSON.stringify(numberOfElementsBeforeIteration)), "\nnumberOfElementsAfterIteration", JSON.parse(JSON.stringify(numberOfElementsAfterIteration)))

        // if isWereElementsAddedToAFollowInThisIteration is true elements were added to a nonTerminalSymbol's follow
        // if isWereElementsAddedToAFollowInThisIteration is false no elements were added to a nonTerminalSymbol's follow so we can exit the do{}while
        let isWereElementsAddedToAFollowInThisIteration = false;
        let count = 0; // used to point which nonTerminalSymbol fo the grammar we are considering

        // check if elements were put inside a follow during this iteration 
        while (!isWereElementsAddedToAFollowInThisIteration && count < inputGrammar.nonTerminalSymbols.length) {
            let currentNonTerminalSymbol = inputGrammar.nonTerminalSymbols[count]; // store current nonTerminalSymbol
            // console.log("currentNonTerminalSymbol", currentNonTerminalSymbol, "before", numberOfElementsBeforeIteration[currentNonTerminalSymbol], "after", numberOfElementsAfterIteration[currentNonTerminalSymbol])
            // if true this means that elements were put inside a nonTerminalSymbol's follow
            // so we cannot stop the do{}while but we have to do another iteration
            // if false this means that no elements were put inside a nonTerminalSymbol's follow
            // so we can stop the do{}while, namely, putting follow() inside follow()
            if (numberOfElementsBeforeIteration[currentNonTerminalSymbol] != numberOfElementsAfterIteration[currentNonTerminalSymbol])
                isWereElementsAddedToAFollowInThisIteration = true;
            count++;
        }

        // update the do{}while condition
        isWereElementsAddedToAFollow = isWereElementsAddedToAFollowInThisIteration;

    } while (isWereElementsAddedToAFollow)


    // iterate all terminal symbols
    for (const terminalSymbol in inputGrammar.terminalSymbols) {
        let currentTerminal = inputGrammar.terminalSymbols[terminalSymbol]; // store currentTerminal symbol
        // if terminal is epsilon ignore it
        if (currentTerminal != epsilon)
            // follow of terminalSymbol does not exist
            follow[currentTerminal] = [];
    }

    // removes all epsilon from follow entries
    for (const nonTerminalSymbol in inputGrammar.nonTerminalSymbols) {
        let currentNonTerminalSymbol = inputGrammar.nonTerminalSymbols[nonTerminalSymbol];
        let indexOfEpsilon = follow[currentNonTerminalSymbol].indexOf(epsilon); // get the index of epsilon in the array
        if (indexOfEpsilon != -1) // if indexOfEpsilon == -1, it means that the array does not have epsilon
            follow[currentNonTerminalSymbol].splice(indexOfEpsilon, 1);
    }

    return follow;

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

/**
 * adds array elements to object at given attribute
 * @param object 
 * @param attribute 
 * @param array 
 */
function addArrayElementsInObjectAttribute(object: Record<string, string[]>, attribute: string, array: string[]) {

    // if there was not a record initialize it
    if (!(attribute in object))
        object[attribute] = []

    // add elements to object attribute
    object[attribute] = [...object[attribute], ...array];

    // removes duplicates
    object[attribute] = removeDuplicates(object[attribute]);

}

/**
 * given a follow in input it computes how many elements eache nonTerminalSymbol 
 * of input grammar has in its follow entry
 * @param inputGrammar 
 * @param follow 
 * @returns 
 */
function getNumberOfElementsOfFollowFunction(inputGrammar: Grammar, follow: Record<string, string[]>) {

    let numberOfElementsOfFollowFunction: Record<string, number> = {} // used to store how many entries have eache nonTerminalSymbol follow() function

    // iterate over all non terminalSymbols
    inputGrammar.nonTerminalSymbols.forEach(nonTerminalSymbol => {

        let numberOfElements = 0; // used to store how many entries has considered nonTerminalSymbol in follow() function

        if (nonTerminalSymbol in follow) // if true then there are entries in nonTerminalSymbol follow() function
            numberOfElements = follow[nonTerminalSymbol].length // get how many entries has nonTerminalSymbol follow() function

        numberOfElementsOfFollowFunction[nonTerminalSymbol] = numberOfElements; // save the entries nonTerminalSymbol of follow() function inside the array

    });

    return numberOfElementsOfFollowFunction;

}

export function test() {

    const tests: TestType[] = [
        {
            input: "E=>TE\'\nE\'=>+TE\'| e\nT=>FT\'\nT\'=>*FT\' | e\nF => (E) | id",
            grammar: {
                initialSymbol: "E",
                nonTerminalSymbols: ['E', "E'", 'T', "T'", 'F'],
                terminalSymbols: ['+', 'e', '*', '(', ')', 'id'],
                productions: {
                    E: ["TE'"],
                    "E'": ["+TE'", 'e'],
                    F: ['(E)', 'id'],
                    T: ["FT'"],
                    "T'": ["*FT'", 'e']
                }
            },
            first: {
                "(": ['('],
                ")": [')'],
                "*": ['*'],
                "+": ['+'],
                E: ['(', 'id'],
                "E'": ['+', 'e'],
                F: ['(', 'id'],
                T: ['(', 'id'],
                "T'": ['*', 'e'],
                id: ['id']
            },
            follow: {
                "(": [],
                ")": [],
                "*": [],
                "+": [],
                E: ['$', ')'],
                "E'": ['$', ')'],
                F: ['*', '+', '$', ')'],
                T: ['+', '$', ')'],
                "T'": ['+', '$', ')'],
                id: []
            }
        },
        {
            input: "R=>TR\'\nR\'=>pTR\'\nT=>FT\'\nT\'=>FT\'\nF=>aF\'\nF=>bF\'\nF\'=>kF\'",
            grammar: {
                initialSymbol: "R",
                nonTerminalSymbols: ['R', "R'", 'T', "T'", 'F', "F'"],
                terminalSymbols: ['p', 'a', 'b', 'k'],
                productions: {
                    F: ["aF'", "bF'"],
                    "F'": ["kF'"],
                    R: ["TR'"],
                    "R'": ["pTR'"],
                    T: ["FT'"],
                    "T'": ["FT'"]
                }
            },
            first: {
                F: ['a', 'b'],
                "F'": ['k'],
                R: ['a', 'b'],
                "R'": ['p'],
                T: ['a', 'b'],
                "T'": ['a', 'b'],
                a: ['a'],
                b: ['b'],
                k: ['k'],
                p: ['p']
            },
            follow: {
                F: ['a', 'b'],
                "F'": ['a', 'b'],
                R: ['$'],
                "R'": ['$'],
                T: ['p'],
                "T'": ['p'],
                a: [],
                b: [],
                k: [],
                p: []
            }
        }
    ]


    for (let count = 0; count < tests.length; count++) {

        let test = tests[count];

        let elementsAreTheSame: boolean = true;

        /** check Grammar object */
        let grammar = parseInput(test.input);
        let grammarCounter = 0;
        let objectKeys = Object.keys(test.grammar);
        while (elementsAreTheSame && grammarCounter < objectKeys.length) {

            let grammarKey = objectKeys[grammarCounter];

            switch (grammarKey) {

                case "initialSymbol":
                    if (test.grammar[grammarKey] != grammar[grammarKey])
                        elementsAreTheSame = false;
                    if (!elementsAreTheSame)
                        console.log("initialSymbol")
                    break

                case "nonTerminalSymbols":
                    elementsAreTheSame = checkIfArraysAreTheSame(test.grammar[grammarKey], grammar[grammarKey])
                    if (!elementsAreTheSame)
                        console.log("nonTerminalSymbols")
                    break;

                case "terminalSymbols":
                    elementsAreTheSame = checkIfArraysAreTheSame(test.grammar[grammarKey], grammar[grammarKey])
                    if (!elementsAreTheSame)
                        console.log("terminalSymbols")
                    break;

                case "productions":
                    let objectKeys = Object.keys(test.grammar[grammarKey]);
                    elementsAreTheSame = checkIfArraysAreTheSame(objectKeys, Object.keys(grammar[grammarKey]))
                    if (!elementsAreTheSame)
                        console.log("productionsHeads")
                    let count = 0;
                    while (elementsAreTheSame && count < objectKeys.length) {
                        let currentObjectKey = objectKeys[count];

                        elementsAreTheSame = checkIfArraysAreTheSame(test.grammar[grammarKey][currentObjectKey], grammar[grammarKey][currentObjectKey])
                        if (!elementsAreTheSame)
                            console.log("productionBody at productionHead", currentObjectKey)
                        count++;
                    }
                    break;
            }
            grammarCounter++;
        }

        if (!elementsAreTheSame)
            return;

        /** check first object */
        let firstFunctionResult = first(grammar);
        elementsAreTheSame = checkIfObjectIsEqualToSourceObject(test.first, firstFunctionResult);

        if (!elementsAreTheSame)
            return;

        let followFunctionResult = follow(grammar, firstFunctionResult);

        elementsAreTheSame = checkIfObjectIsEqualToSourceObject(test.follow, followFunctionResult);

        if (!elementsAreTheSame)
            return;

        if (elementsAreTheSame)
            console.log(`Test #${count + 1}: Success`)
    }

}

/**
 * check if two arrays have the same elements
 * @param firstArray 
 * @param secondArray 
 * @returns 
 */
function checkIfArraysAreTheSame(firstArray: string[], secondArray: string[]) {

    // if arrays have different lengths they are not the same
    if (firstArray.length != secondArray.length)
        return false;

    // if the arrays differ by one element they are not the same
    for (let count = 0; count < firstArray.length; count++) {

        let element = firstArray[count]; // get considered element

        // if true element is not in secondArray
        // that means that the two arrays are not the equals
        if (secondArray.indexOf(element) == -1)
            return false;
    }

    return true;

}

/**
 * checks if two objects are the same object
 * @param sourceObject 
 * @param secondObject 
 * @returns 
 */
function checkIfObjectIsEqualToSourceObject(sourceObject: Record<string, string[]>, secondObject: Record<string, string[]>) {

    let objectKeys = Object.keys(sourceObject);

    // if keys are not equals, objects are not the same
    if (!checkIfArraysAreTheSame(objectKeys, Object.keys(secondObject))) {
        console.log("objecthead")
        return false;
    }

    // iterate over object keys
    for (const objectHead in sourceObject) {

        // if object bodies of every key are not the same, objects are not the same
        if (!checkIfArraysAreTheSame(sourceObject[objectHead], secondObject[objectHead])) {
            console.log("objectBody at head", objectHead)
            return false;
        }
    }

    return true;

}