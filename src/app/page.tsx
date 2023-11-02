'use client'

import { parseInput, first, follow, test, parsingTable } from "@/lib/utils"
import { useState } from "react"
import styles from './page.module.css'
import { Computed } from "@/types/Computed"

export default function Home() {

  const [input, setInput] = useState('')
  const [computed, setComputed] = useState<Computed | null>(null)

  function compute() {

    let grammar = parseInput(input);
    console.log(grammar)
    let firstFunctionResult = first(grammar);
    console.log(firstFunctionResult)
    let followFunctionResult = follow(grammar, firstFunctionResult);
    console.log(followFunctionResult)
    let parsingTableResult = parsingTable(grammar, firstFunctionResult, followFunctionResult)
    console.log("parsingTableResult", parsingTableResult)

    setComputed({
      grammar: grammar,
      first: firstFunctionResult,
      follow: followFunctionResult,
      parsingTable: parsingTableResult
    });
  }

  return (
    <div className={styles.outerDiv}>

      <textarea onChange={e => setInput(e.target.value)} />

      <button onClick={compute}>Compute</button>
      <button onClick={test}>Test</button>

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


        </div>
      }

    </div>
  )
}
