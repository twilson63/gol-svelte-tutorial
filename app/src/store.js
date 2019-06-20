import gol from './gol'
import { readable } from 'svelte/store'

export const size = 32

const sim = gol({
  size, 
  speed: 1000,
  generate: true
})
export const store = readable(sim.board, function (set) {
  sim.onTick(board => {
    set(board)
  })  
})

export const start = sim.start
export const stop = sim.stop
export const toggle = sim.toggle
export const generate = sim.generate
