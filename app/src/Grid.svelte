<script>
let size = 32
</script>
<section class="section">
  <div class="container">
    <div class="grid" style="--size:{size}">
    </div>
  </div>
</section>
<style>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 

cool responsive grid ty potch 
https://www.youtube.com/watch?v=2UxA9oBWV9U

*/
.grid {
    border: 1px solid #000;
    --width: 80vmin;
    width: var(--width);
    height: var(--width);
    display: grid;
    grid-template-rows: repeat(var(--size), 1fr);
    grid-template-columns: repeat(var(--size), 1fr);
    background: #000;
    grid-gap: 1px;
  }
</style>

