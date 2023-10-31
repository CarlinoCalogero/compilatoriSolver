'use client'

import { useState } from "react"

type Grammar = {
  initialSymbol: string,
  nonTerminalSymbols: string[],
  terminalSymbols: string[]
}

type CheckSymbolFunctionReturnType = {
  nonTerminalSymbol: boolean,
  nonTerminalSymbolFollowedByApostrof: boolean,
  apostrophe: boolean,
  terminal: boolean,
  terminalFollowedByNonTerminalSymbol: boolean,
  terminalFollowedByNonTerminalSymbolWithAprostrophe: boolean,
  terminalFollowedByTerminalOrApostrophe: boolean,
  compoundTerminal: boolean,
  sumToIndex: number,
}

export default function Home() {

  const [input, setInput] = useState('')

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

  function parseInput() {

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

    // get initial symbol
    newGrammar.initialSymbol = productionsArray[0].substring(0, productionsArray[0].indexOf('='));

    // get all nonTerminalSymbols
    productionsArray.forEach(production => {

      newGrammar.nonTerminalSymbols.push(production.substring(0, production.indexOf('=')))

    });

    // get all terminalSymbols
    let possibleTerminalsArray: string[] = [];
    productionsArray.forEach(production => {

      // get the production body
      let productionBody = production.substring(production.indexOf(">") + 1);

      // check if there is more then one body
      let productionBodyArray = productionBody.split('|');

      productionBodyArray.forEach(currentProductionBody => {

        let count = 0;
        while (count < currentProductionBody.length) {

          console.log("count", count, currentProductionBody)
          let responce = checkSymbol(newGrammar.nonTerminalSymbols, currentProductionBody, count);

          if (responce.terminal || responce.terminalFollowedByNonTerminalSymbol || responce.terminalFollowedByNonTerminalSymbolWithAprostrophe || responce.terminalFollowedByTerminalOrApostrophe) {
            console.log("miao", currentProductionBody[count], responce.sumToIndex)
            if (responce.sumToIndex == 1) {
              possibleTerminalsArray.push(currentProductionBody[count]);
            } else {
              possibleTerminalsArray.push(currentProductionBody.substring(count, count + responce.sumToIndex))
            }
          }

          count = count + responce.sumToIndex;

        }

      });

    });

    console.log(possibleTerminalsArray)
  }

  return (
    <div>

      <textarea onChange={e => setInput(e.target.value)} />

      <button onClick={parseInput}>Print</button>


    </div>
  )
}
