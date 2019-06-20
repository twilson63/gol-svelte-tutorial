# SvelteJS Tutorial

Using this tutorial you will build a Game of Life SvelteJS Application.

In case you have not heard of Conway's Game of Life, you can find out about it here:

https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

Conway's Game of Life is a simulation game that has pre-defined rules. The game operates on a grid with a set number of cells. We already have a game engine to use, so our focus is to build the user interface on top.

The game engine has the following methods:

* constructor (size, speed, generate)
* onTick (fn) - takes a callback function that will get called everytime the board changes
* start - function that starts the simulation
* stop - function that stops the simulation
* generate - function that generates a new board

Also, we are using bulma css to provide some styling. With Svelte you can add css at the component level as well (and we will see some examples of that), but for this tutorial, you do not have to worry about css unless you want to improve your own game's look and feel.

## Requirements

* NodeJS
* Git

## Clone the project

```sh
npx degit twilson63/gol-svelte-tutorial tutorial
cd tutorial
```

## Setup

Everything you need is in the app directory; simply change directory (ie `cd app`) from this home directory.

```sh
cd app
npm install .
npm run build:css
```

> Open the project in your favorite code editor.

Start the dev server:

```sh
npm run dev
```

> Open the app in your browser `http://localhost:5000`

## Lesson 1: Creating a Component

In Svelte, every component is a file using `.svelte` extension

A component is made up of html, style and script elements. In our first component, we will only need to use html and script elements.

Let's open `src/Header.svelte`!

Our component has a good start; it has html and a script block, but it is hard coded with values for the title and subtitle.

Before we make them dynamic, let's open our `src/App.svelte` file and import the Header from our other file.

To import a component in svelte, we need to use an import statement. Remember to include the extension in the import.
Now reference the component in the html markup:

```svelte
<script>
import Header from './Header.svelte'
</script>
<Header />
```

When we save the `src/App.svelte` file, we should see a new `Header` appear in our browser.

Now let's return to our `src/Header.svelte` file and make our title and subtitle dynamic.

We can use `{}` in our html to specify a dynamic value. These dynamic values are known as _state_ or _props_; if we want them to be _state_, we simply declare them in our script as local variables.

```svelte
<script>
let title = "Game of Life"
let subtitle = "A Life Simulation in Svelte"
</script>

```

Now we can add our dynamic values in our markup:

```svelte
<h1 class="title">{title}</h1>
<h2 class="subtitle">{subtitle}</h2>
```

> Svelte will replace the dynamic values with the declared local variables of the same name.

But what if we wanted to specify the values from a parent component? We could pass the values 
down as _props_...

Let's give it a shot; change the local variables as exports like so:

```svelte
<script>
export let title
export let subtitle
</script>
```

From our parent (`Header`) component, we need to pass the values down to the child (`App`) component. Lets open `src/App.svelte` and add the props as attributes to the Header tag:

```svelte
<Header
  title="Game of Life"
  subtitle="Conway's Game of Life Simulator using Svelte"
/>
```

Once we save the `App.svelte` file and the `Header.svelte` file, we should see the changes in the browser.

### Summary

In this lesson, we jumped right in and created a simple component. 
The component existed in a single file with an html and a script tag. 
We learned that the script tag can contain state or props by simply declaring variables. 
We can use `{}` to specify dynamic values in our components. 
We can import components using the ES module syntax, and using html attributes we can pass values down to our children components as props.

## Lesson 2: Building the board using directives

Now that we have a header, we need to add the board. The board in the Game of Life consists of cells; 
each cell has "neighbors" (adjacent cells), and based on their neighbors they are either alive or dead. 
In our board, a cell with the background color of white signifies 'dead' and a background color of black signifies 'alive'.

Now, in our `src/App.svelte` component, let's import the `src/Grid.svelte`:

```svelte
<script>
import Grid from './Grid.svelte'
...
</script>
...
<Grid />
```

After importing our Grid file and instantiating the component (by adding it to our component template as a tag), 
we should see a solid black square.

Our gol engine is in the `gol.js` file, and we need a way to bridge the engine with the presentation layer (our `Grid`).
Svelte has a concept called stores that work great for this purpose.

https://svelte.dev/docs#svelte_store

You can see our store here:

```js
import gol from './gol'
import { readable } from 'svelte/store'

export const size = 32

const sim = gol({
  size: size, 
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
``` 

I am not going to spend too much time on this module, but basically we are 
creating a new instance of the game (with a board size of 32 x 32 cells), setting the speed to 
1 second, and autogenerating the board. Then, we are exporting some of these 
functions. The most important export is the store; it is a readable entity, which
means our svelte components will be able to react to any value updates from the simulation engine.

Let's open the `src/Grid.svelte` file and import the store (and the component size to responsively determine the size of the board). Let's also import the `src/Cell.svelte` component.

```svelte
<script>
import { store, size } from './store'
import Cell from './Cell.svelte'
// let size = 32 (comment this out; we don't need it anymore)
</script>
```

> NOTE: if you look at the style sheet of the grid class, you will see we are using css variables to provide the dynamic values.

The store component has a subscribe function that returns a value everytime a change occurs. We can access this using shorthand with the $ prefix. 

```js
console.log($store)
```

We should now see the board; it is an array of rows, and for each row there is an array of cells.

If we want to paint this board on our grid, we will need two loops:
the first loop will iterate on every row, while the inner loop
will iterate on every column. Then we will create a cell for each row/column pair.

Svelte has a few simple blocks to help with logic in the template area.
One is called `each`; this block takes an array (followed by the `as` operator) then the variable name that represents the value of the item in the array. There are a couple of optional items in the expression named index and key.

Here is what an `each` block looks like:

```svelte
{#each [array] as [item], [index] (key)}
....
{/each}
```

Svelte blocks use the `{}` braces and the `#` to indicate the start of the block and `/` to indicate the end of the block.

```svelte
{#each expression} <!-- start -->
...
{/each} <!-- end -->
```

The `each` block takes a specific expression to iterate over an array of items:

`[array] as [item], [index] (key)`

The index and key are optional; however, the key must also be unique.

Using our store, here is what our each block will look like for our rows:

```svelte
{#each $store as r, row}
...
{/each}
```

This is great, but we need an inner loop. Because the r is another array, we can nest the `each` blocks.

```svelte
{#each $store as r, row}
  {#each r as alive, col}
    ...
  {/each}
{/each}
```

In the innermost `<div>` tag of the `Grid.svelte` file (referencing the `grid` class and its `style`), let's render a `Cell` component for every space on the board.

Additionally, as we declare the cell block, lets add the row, col, and alive attributes. This will set up our next lesson.


```svelte
<div class="grid" style="--size:{size}">
  {#each $store as r, row}
    {#each r as alive, col}
      <Cell row={row} col={col} alive={alive} /> 
   {/each}
  {/each}
</div>
```


### Summary

In this lesson, we learned a little about stores and how they can help us connect functionality into our svelte application. We learned about reactivity and how everytime the board changes we will get an update of that value using the subscribe function and the shortcut `$` helper. We learned about template blocks and how to use the `#each` template block to iterate over an array and use the expression to get the values we need from the array. 

## Lesson 3: making the cells come alive

Now that we have a grid, we need to open our `src/Cell.svelte` component and export the props that we are providing as attributes.

```svelte
<script>
export let row
export let col
export let alive
</script>
```

We want to use the `alive` value to toggle a class on the cell `<div>` tag.
To do this, you may be thinking to use an expression in the class attribute value like this:

```svelte
<div class="cell {alive ? 'alive' : ''}" />
```

Which would work (with no problem), but svelte is a compiler;
so, we can do things like this to make it a little more readable:

```svelte
<div class="cell" class:alive />
```

This short hand will add the `.alive` class name to the cell if the alive variable is true. Neat!

When you save this component, you should now see the cells come to life; awesome! However, we do not have any reactivity; we need a button to initiate the life engine.

Open the `src/Header.svelte` component and import `src/Actions.svelte` inside.

```svelte
<script>
import Actions from './Actions.svelte'
...
</script>
<!-- in the second column tag add the actions component -->

<div class="column">
  <Actions />
</div>
```

Now, once you save this file, you should see three buttons: these buttons will control the engine.
In order to do this, we need to capture their click events and then call the functions exported from our `store`.

Open the `src/Actions.svelte` component and let's import these functions from our store.

```svelte
<script>
import { start, stop, generate } from './store'
</script>
```

With svelte we can use the `on` directive to listen to any event that an element may emit.
In this case, we want to handle the click event; so, for each button, let's handle the event and call respective functions from the store like so:

```svelte
<button class="button is-success" on:click={start}>Start</button>
<button class="button is-danger" on:click={stop}>Stop</button>
<button class="button is-info" on:click={generate}>Generate</button>
```

Let's save these buttons, and go to the browser: if you click on the start button,
you should start to see the game play; likewise, if you click the stop button,
you should see the game stop. Finally, if you click the generate button,
you will get a new board.
Yayy!!! You are learning svelte!

### Summary

In this lesson we learned how to receive props from a parent component and how to use a prop to add or remove a class to a tag using svelte shorthand. We learned about the `on` directive and how to add a listener to the button's click event, and we learned how to leverage the expression by adding it to a function handler.

## Lesson 4: Toggle a cell

This Life simulator has the ability to toggle cells so that you can make your own boards. In order to leverage this feature we need to capture the click event of the cell and invoke the life's toggle function; the problem is, this function requires the coordinates of the cell in order to know which cell in the board to toggle.

We can import the toggle function in our `src/Cell.svelte` component and and use the exported row and col values to identify the cell. See if you can do this exercise yourself, using the things we learned from previous lessons. 

Tasks:

* import the toggle function from the store module.
* create a click function handler in the script tag.
* in the function handler, call the imported toggle function passing the row and col as arguments
* use the `on` directive and the `click` event on the cell div to invoke the click handler

### Answer

Take a look a the `src/Cell-answer.svelte` file if you need some hints or if you got it right.


## Fin

Congrats! You completed the tutorial; this is by no means a comprehensive lesson, but it should introduce you to some of the concepts of svelte and get a sense on how intuitive and well-thought each part of the framework is. 

## For an Additional Challenge...

* Make the cells random colors for a psychedelic game of life
* Open up `gol.js` and play around with rule, maybe 2 neighbors generates life or 6 destroys
* Create a form to accept the size attribute and make the engine adjust size when generated
* get creative

Did you make something cool? Send me your work! Tweet @twilson63
