import { CheckSymbolFunctionReturnType } from "@/types/CheckSymbolFunctionReturnType";
import { Grammar } from "@/types/Grammar";

function checkSymbol(nonTerminalSymbolsArray: string[], inputString: string, currentSymbolIndex: number) {

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

        let responce = checkSymbol(nonTerminalSymbolsArray, inputString, currentSymbolIndex + 1);

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

export function parseInput(input: string) {

    // create grammar object
    let newGrammar: Grammar = {
        initialSymbol: '',
        nonTerminalSymbols: [],
        terminalSymbols: []
    }

    // remove spaces from text
    let parsedInput = input.replace(/ /g, '');

    // split productions
    let productionsArray = parsedInput.split('\n')

    if (productionsArray.length == 0)
        return;

    /** get initial symbol */
    newGrammar.initialSymbol = productionsArray[0].substring(0, productionsArray[0].indexOf('='));

    /** get all nonTerminalSymbols */
    productionsArray.forEach(production => {

        newGrammar.nonTerminalSymbols.push(production.substring(0, production.indexOf('=')))

    });

    /** get all possible terminal symbols */
    let possibleTerminalsArray: string[] = [];
    productionsArray.forEach(production => {

        // get the production body
        let productionBody = production.substring(production.indexOf(">") + 1);

        // check if there is more then one body
        let productionBodyArray = productionBody.split('|');

        // check all production's bodies
        productionBodyArray.forEach(currentProductionBody => {

            let count = 0;
            while (count < currentProductionBody.length) {

                // check symbol
                let responce = checkSymbol(newGrammar.nonTerminalSymbols, currentProductionBody, count);

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

                    let untouchedPossibleTerminal = currentPossibleTerminal; // stores the orinal possible terminal value

                    // iterate over our true terminals
                    newGrammar.terminalSymbols.forEach(terminalSymbol => {

                        // if possible terminal is made up by true terminals we remove them from the string
                        if (currentPossibleTerminal.includes(terminalSymbol)) {
                            currentPossibleTerminal = currentPossibleTerminal.replaceAll(terminalSymbol, '');
                        }

                    });

                    // console.log("_currentPossibleTerminal", currentPossibleTerminal, "lenght", currentPossibleTerminal.length)
                    // empty string means that the possibile terminal was completely made up by true terminals, therefore we won't add it to the true terminals array
                    if (currentPossibleTerminal != '') {
                        newGrammar.terminalSymbols.push(untouchedPossibleTerminal)
                    }

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

    console.log(newGrammar)
}