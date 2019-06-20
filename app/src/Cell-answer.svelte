<script>
import { toggle } from './store'

export let row
export let col
export let alive

function clickHandler() {
  toggle(row, col)
}
</script>
<div class="cell" class:active on:click={clickHandler} />
<style>
.cell {
  background: #fff;
  position: relative;
}  

.alive {
  background: #000;
}
</style>
