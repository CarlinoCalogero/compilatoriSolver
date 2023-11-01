'use client'

import { first, follow, parseInput } from "@/lib/utils"
import { useState } from "react"

export default function Home() {

  const [input, setInput] = useState('')

  return (
    <div>

      <textarea onChange={e => setInput(e.target.value)} />

      <button onClick={e => console.log(parseInput(input))}>Print</button>

      <button onClick={e => first(parseInput(input))}>first</button>

      <button onClick={e => {
        let grammar = parseInput(input);
        let firstReturnValue = first(grammar);
        console.log(follow(grammar, firstReturnValue))
      }}>follow</button>

    </div>
  )
}
