'use client'

import { first, parseInput } from "@/lib/utils"
import { useState } from "react"

export default function Home() {

  const [input, setInput] = useState('')

  return (
    <div>

      <textarea onChange={e => setInput(e.target.value)} />

      <button onClick={e => parseInput(input)}>Print</button>

      <button onClick={e => first(parseInput(input))}>first</button>

    </div>
  )
}
