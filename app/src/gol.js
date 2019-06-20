import {
  times,
  equals,
  nth,
  compose,
  update,
  gt,
  lt,
  and,
  not,
  __,
  map,
  addIndex,
  sum,
  add,
  subtract,
  tap,
  flatten,
  curry,
  reduce
} from 'ramda'

// get random integer function
import randomInt from 'random-int'
const mapIndex = addIndex(map)
const curryMap = curry(map)

/*
settings:

- size: default 20
- generate: true | false
- speed: 1000
*/
const sim = ({ size = 20, generate = true, speed = 1000 }) => {
  let running = false
  let doTick = () => null
  // create board
  let board = times(n => times(createCell, size), size)
  // handle game tick
  //   notify new board for redraw
  function tick() {
    // process board
    board = mapIndex(
      (v, row) =>
        mapIndex((value, col) => {
          const alive = equals(1, value)
          const n = neighbors(row, col)
          // 3 neighbors and not alive
          if (and(equals(n, 3), not(alive))) return 1

          // less than 2 neighbors and alive - decease
          if (and(lt(n, 2), alive)) return 0

          // if 2 neighbors and alive then keep alive
          if (and(equals(n, 2), alive)) return 1

          // if 3 neighbors and alive then keep alive
          if (and(equals(n, 3), alive)) return 1

          // if more than 3 neighbors and alive then decease
          if (and(gt(n, 3), alive)) return 0

          // otherwise return existing value
          return value
        }, v),
      board
    )

    doTick(board)
    //console.log(active())
    if (and(running, active())) {
      setTimeout(tick, speed)
    }
  }
  // console.log(board)
  return {
    start,
    stop,
    toggle,
    tick,
    onTick,
    board,
    generate
  }

  function generate() {
    board = times(n => times(createCell, size), size)
    doTick(board)  
  }
  function onTick(fn) {
    doTick = fn
  }

  function start() {
    running = true
    setTimeout(tick, speed)
  }

  function stop() {
    running = false
  }

  function toggle(row, col) {
    const canToggle = and(not(running), inBoard(size)(row, col))

    if (canToggle) {
      let value = equals(1, nth(col, nth(row, board))) ? 0 : 1
      board = updateCell(board, row, col, value)
    }

    doTick(board)

    return board
  }

  function createCell() {
    return generate ? randomInt(0, 1) : 0
  }

  function updateCell(board, row, col, value) {
    const newRow = compose(update(col, value), nth(row))(board)

    return update(row, newRow, board)
  }

  function inBoard(size) {
    return (row, col) =>
      and(and(gt(row, -1), gt(col, -1)), and(lt(row, size), lt(col, size)))
  }

  function getValue([row, col]) {
    return inBoard(size)(row, col) ? nth(col, nth(row, board)) : 0
  }

  function active() {
    return gt(reduce((acc, v) => acc + sum(v), 0, board), 0)
  }

  function neighbors(row, col) {
    return sum(
      map(getValue, [
        [subtract(row, 1), subtract(col, 1)],
        [subtract(row, 1), col],
        [subtract(row, 1), add(col, 1)],
        [row, subtract(col, 1)],
        [row, add(col, 1)],
        [add(row, 1), subtract(col, 1)],
        [add(row, 1), col],
        [add(row, 1), add(col, 1)]
      ])
    )
  }
}

export default sim
