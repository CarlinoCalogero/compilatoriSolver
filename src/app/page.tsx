'use client'

import { parseInput, first, follow, test } from "@/lib/utils"
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

    setComputed({
      grammar: grammar,
      first: firstFunctionResult,
      follow: followFunctionResult
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


        </div>
      }

    </div>
  )
}
