'use client'

import { parseInput, first, follow, test, parsingTable, nonRecursivePredictiveParsing, reverseArray, automaLR0, getArrayItemsAsStringWithNewLinesInsteadOfCommas } from "@/lib/utils"
import { useState } from "react"
import styles from './page.module.css'
import { Computed } from "@/types/Computed"
import { NonRecursivePredictiveParsingReturnType } from "@/types/NonRecursivePredictiveParsingReturnType"

export default function Home() {

  const [inputGrammar, setInputGrammar] = useState('')
  const [inputString, setInputString] = useState('')
  const [computed, setComputed] = useState<Computed | null>(null)

  function compute() {

    // create an "empty" object
    let newComputed: Computed = {
      grammar: null,
      first: null,
      follow: null,
      parsingTable: null,
      nonRecursivePredictiveParsing: null,
      automaLR0: null
    }

    try {
      if (inputGrammar.length != 0)
        newComputed.grammar = parseInput(inputGrammar);
    } catch (error) {
      console.log("Problem is grammar parsing")
      console.error(error)
    }

    try {
      if (newComputed.grammar != null)
        newComputed.first = first(newComputed.grammar);
    } catch (error) {
      console.log("Problem is first() function")
      console.error(error)
    }

    try {
      if (newComputed.grammar != null && newComputed.first != null)
        newComputed.follow = follow(newComputed.grammar, newComputed.first)
    } catch (error) {
      console.log("Problem is follow() function")
      console.error(error)
    }

    try {
      if (newComputed.grammar != null && newComputed.first != null && newComputed.follow != null)
        newComputed.parsingTable = parsingTable(newComputed.grammar, newComputed.first, newComputed.follow)
    } catch (error) {
      console.log("Problem is parsingTable")
      console.error(error)
    }

    try {
      if (inputString.length != 0 && newComputed.grammar != null && newComputed.parsingTable != null)
        newComputed.nonRecursivePredictiveParsing = nonRecursivePredictiveParsing(newComputed.grammar, inputString, newComputed.parsingTable)
    } catch (error) {
      console.log("Problem is nonRecursivePredictiveParsingResult")
      console.error(error)
    }

    try {
      if (newComputed.grammar != null)
        newComputed.automaLR0 = automaLR0(newComputed.grammar);
      // console.log("automaLR0FunctionResult", automaLR0FunctionResult)
    } catch (error) {
      console.log("Problem is automaLR0")
      console.error(error)
    }


    setComputed(newComputed);
  }

  return (
    <div className={styles.outerDiv}>

      <div className={styles.explainationDiv}>
        <h1>Example of grammar:</h1>
        <div className={styles.exampleGrammarDiv}>
          <span>{"E=>TE'"}</span>
          <span>{"E'=>+TE'|e"}</span>
          <span>{"T=>FT'"}</span>
          <span>{"T'=>*FT'|e"}</span>
          <span>{"F=>(E)|id"}</span>
        </div>
        <span>{"Where epsilon is 'e'"}</span>
      </div>


      <textarea placeholder="InputGrammar" onChange={e => setInputGrammar(e.target.value)} />
      <input placeholder="Input string" type="text" onChange={e => setInputString(e.target.value)} />

      <button onClick={compute}>Compute</button>
      {
        false &&
        <button onClick={test}>Test</button>
      }

      {
        computed != null &&
        <div className={styles.tablesDiv}>

          {
            computed.first != null &&
            <div>
              <span>First</span>

              <table>

                <thead>
                  <tr>
                    {
                      Object.keys(computed.first).map((symbol, i) => <td key={"td_thead_first_" + i}>{symbol}</td>)
                    }
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    {
                      Object.keys(computed.first).map((symbol, i) => <td key={"td_tbody_first_" + i}>{computed.first != null && (computed.first[symbol].length == 0 ? '-' : computed.first[symbol].toString())}</td>)
                    }
                  </tr>
                </tbody>

              </table>

            </div>
          }


          {
            computed.follow != null &&
            <div>
              <span>Follow</span>

              <table>

                <thead>
                  <tr>
                    {
                      Object.keys(computed.follow).map((symbol, i) => <td key={"td_thead_follow_" + i}>{symbol}</td>)
                    }
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    {
                      Object.keys(computed.follow).map((symbol, i) => <td key={"td_tbody_follow_" + i}>{computed.follow != null && (computed.follow[symbol].length == 0 ? '-' : computed.follow[symbol].toString())}</td>)
                    }
                  </tr>
                </tbody>

              </table>

            </div>
          }

          {
            computed.parsingTable != null &&
            <div>
              <span>Parsing Table</span>

              <table>

                <thead>
                  <tr>
                    <td rowSpan={2}>Non Terminale</td>
                    <td align="center" colSpan={Object.keys(computed.parsingTable[Object.keys(computed.parsingTable)[0]]).length}>Terminale</td>
                  </tr>
                  <tr>
                    {
                      Object.keys(computed.parsingTable[Object.keys(computed.parsingTable)[0]]).map((column, i) => <td key={"td_thead_parsingTable_" + i}>{column}</td>)
                    }
                  </tr>
                </thead>

                <tbody>
                  {
                    Object.keys(computed.parsingTable).map((nonTerminalSymbol, i) =>
                      <tr key={"tr_tbody_parsingTable_" + i}>
                        <td>{nonTerminalSymbol}</td>
                        {
                          computed.parsingTable != null &&
                          Object.keys(computed.parsingTable[nonTerminalSymbol]).map((row, j) =>
                            <td key={"td_tbody_parsingTable_" + i + "_" + j}>{computed.parsingTable != null && computed.parsingTable[nonTerminalSymbol][row].toString()}</td>)
                        }
                      </tr>
                    )
                  }
                </tbody>

              </table>

            </div>
          }

          {
            computed.nonRecursivePredictiveParsing != null &&
            <div>
              <span>Non-recursive Predictive Parsing</span>

              <table>
                <thead>
                  <tr>
                    {
                      Object.keys(computed.nonRecursivePredictiveParsing).map((column, i) => <td key={"td_thead_nonRecursivePredictiveParsing_" + i}>{column}</td>)
                    }
                  </tr>
                </thead>

                <tbody>
                  {
                    Object.keys(computed.nonRecursivePredictiveParsing[Object.keys(computed.nonRecursivePredictiveParsing)[0] as keyof NonRecursivePredictiveParsingReturnType]).map((number, i) =>
                      <tr key={"td_tbody_nonRecursivePredictiveParsing_" + i}>
                        <td>{computed.nonRecursivePredictiveParsing != null && computed.nonRecursivePredictiveParsing.matched[Number(number)]}</td>
                        <td>{computed.nonRecursivePredictiveParsing != null && reverseArray(computed.nonRecursivePredictiveParsing.stack[Number(number)])}</td>
                        <td>{computed.nonRecursivePredictiveParsing != null && computed.nonRecursivePredictiveParsing.input[Number(number)]}</td>
                        <td>{computed.nonRecursivePredictiveParsing != null && computed.nonRecursivePredictiveParsing.output[Number(number)]}</td>
                      </tr>
                    )
                  }

                </tbody>

              </table>

            </div>
          }

          {
            computed.automaLR0 != null &&
            <div>
              <span>AutomaLR0</span>

              <table>

                <thead>
                  <tr>
                    <td>I</td>
                    <td>Item Set</td>
                    {
                      Object.keys(computed.automaLR0[0].otherColumns).map((column, i) => <td key={"td_thead_automaLR0_" + i}>{column}</td>)
                    }
                  </tr>
                </thead>

                <tbody>
                  {
                    computed.automaLR0.map((automaLR0Row, i) =>
                      <tr key={"td_tbody_automaLR0_" + i}>
                        <td >{`I${automaLR0Row.rowNumber}`}</td>
                        <td style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{`Kernel:\n[${getArrayItemsAsStringWithNewLinesInsteadOfCommas(automaLR0Row.itemSet.kernel)}]${automaLR0Row.itemSet.notInKernel.length != 0 ? `\n\nNotInKernel:\n[${getArrayItemsAsStringWithNewLinesInsteadOfCommas(automaLR0Row.itemSet.notInKernel)}]` : ""}`}</td>
                        {
                          Object.keys(automaLR0Row.otherColumns).map((column, j) =>
                            <td key={"td_tbody_automaLR0_" + i + "_" + j}>{automaLR0Row.otherColumns[column].length != 0 ? `I${automaLR0Row.otherColumns[column]}` : '-'}</td>
                          )
                        }
                      </tr>
                    )
                  }
                </tbody>

              </table>

            </div>
          }


        </div>
      }

    </div>
  )
}
