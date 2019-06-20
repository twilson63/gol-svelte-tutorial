# SvelteJS Tutorial

In this tutorial, you will build a Game of Life SvelteJS Application.

Not heard of Game of Life, you can find out about it here:

https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

Game of life is a simulation of game that has pre-defined rules and operates on a grid, with a set number of cells. We have a game engine to use, our focus is to build the user interface on top of the game engine.

The game engine has the following methods:

* constructor (size, speed, generate)
* onTick (fn) - takes a callback function that will get called everytime the board changes
* start - function that starts the simulation
* stop - function that stops the simulation
* generate - function that generates a new board

Also, we are using bulma css to provide some styling, with Svelte you can add css at the component level as well, and we will see some examples of that, but for this tutorial, you do not have to worry about css, unless you want to, feel free to improve the look and feel as desired.

## Requirements

* NodeJS
* Git

## Clone the project

```
npx degit twilson63/gol-svelte-tutorial tutorial
cd tutorial
```

## Setup

Everything you need is in the app directory, simply change directory ie `cd app` from this home directory.

```
cd app
npm install .
```

> Open the project in your favorite code editor.

Start the dev server

```
npm run dev
```

> Open the app in your browser `http://localhost:5000`

## Lesson 1: Creating a Component

In svelte, every component is a file using `.svelte` extension

A component is made up of html, style and script elements, in our first 
component, we will only need to use the html and script elements.

Lets open `src/Header.svelte`

Our component has a good start, it has html and a script block, but it is hard coded with
some values for the title and subtitle.

Before we make them dynamic, lets go to our `src/App.svelte` component and import our Header component.

To import a component in svelte, we need to use an import statement, but we need to include the extension in the import.

Then we can reference the component in the html markup.

```
<script>
import Header from './Header.svelte'
</script>
<Header />
```

When we save the `src/App.svelte` file, we should see the Header component appear in our 
browser.

Now we need to go over to the `src/Header.svelte` file and make our title and subtitle dynamic.

We can use `{}` in our html to specify a dynamic value. These dynamic values are known as state or props, if we want them to be state, we simply declare them in our script as local variables.

```
<script>
let title = "Game of Life"
let subtitle = "A Life Simulation in Svelte"
</script>

```

Now we can add our dynamic values in our markup

```
<h1 class="title">{title}</h1>
<h2 class="subtitle">{subtitle}</h2>
```

> Svelte will replace the dynamic values with the declared local variables of the same name.

But what if we wanted to specify the values from a parent component, we could pass the values 
down as props.

Lets give it a shot. Change the local variables as exports

```
<script>
export let title
export let subtitle
</script>
```

In our parent component, we need to pass the values down to the child component. Lets open `src/App.svelte` and add the props as attributes to the Header tag.

```
<Header
  title="Game of Life"
  subtitle="Conways Game of Life Simulator using Svelte"
/>
```

Once we save the App.svelte file and the Header.svelte file, we should see the changes in the browser.

### Summary

In this lesson, we jumped right in and created a simple component, the component existed in a single file with html and a script tag. The script tag can contain state and props, by simply declaring variables. We can use the `{}` to specify dynamic values in our components. We can import components using the ES module syntax. Using html attributes we can pass values down to our children components as props.

## Lesson 2: Building the board using directives

Now that we have a header, we need to add the board, the board in the game of life consists of cells, each cell has neighbors and based on their neighbors they are either alive or dead. In our board, if the cell has a background color of white they are dead and if it has a background color of black they are alive.

In our `src/App.svelte` component, lets import our `src/Grid.svelte` component.

```
<script>
import Grid from './Grid.svelte'
...
</script>
...
<Grid />
```

By importing our Grid file and instanciating the component by adding it to our component template as a tag. We should see a solid black square.

Our gol engine is in the `gol.js` file and we need a way to bridge the engine with the presentation layer. Svelte has the concept called stores that work great for this purpose.

https://svelte.dev/docs#svelte_store

You can see our store here:

```
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
creating our Life engine with a size of 32 x 32 cells, and setting the speed to 
1 sec and asking to autogenerate the board. Then we are exporting some of the 
functions. The most important export is the store, it is a readable store, which
means our svelte components will be able to react to any value updates from the 
simulation engine.

Lets open the `src/Grid.svelte` file and import the store, we also want to import the size 
constant as well. We will want to use it to tell the grid the size of board from a responsive 
point of view. Lets also import the `src/Cell.svelte` component.

```
<script>
import { store, size } from './store'
import Cell from './Cell.svelte'
// let size = 32
</script>
```

> NOTE: if you look a the style of the grid, you will see we are using css variables to provide
the css dynamic values.

The store component has a subscribe function that returns a value everytime a change occurs, we can access this use a shorthand, $ prefix. 

```
console.log($store)
```

We should see the board, it is an array of rows and for each row there is an array of cells.

So if we want to paint this board on our grid, we will need two loops, the first loop, will iterate on every row, the inner loop will iterate on every column, then we will create a cell.

Svelte has a few simple blocks to help with logic in the template area, one is called `each` this block takes an array followed by the as operator then the variable name that represents the value of the item in the array, there are a couple of optional items in the expression, index and key.

Here is what an each block looks like.

```
{#each [array] as [item], [index] (key)}
....
{/each}
```

Svelte blocks use the `{}` braces and the `#` to indicate start of the block and `/` to indicate the end of the block.

```
{#each expression} <!-- start -->
...
{/each} <!-- end -->
```

The each block takes a specific expression to iterate over an array of items:

`[array] as [item], [index] (key)`

The index and key are optional, the key also must be unique.

Using our store, here is what our each block will look like for our rows:

```
{#each $store as r, row}
...
{/each}
```

This is great, but we need an inner loop, because the r is another array, we can nest the 
each blocks.

```
{#each $store as r, row}
  {#each r as alive, col}
    ...
  {/each}
{/each}
```

And we need to add our `Cell` component inside the inner each block, to render the cell for every cell on the board.

```
{#each $store as r, row}
  {#each r as alive, col}
    <Cell row={row} col={col} alive={alive} /> 
  {/each}
{/each}

```

As we declare the cell block, lets add the row, col, and alive attributes. This will set up our next lesson.

### Summary

In this lesson, we learned a little about stores and how they can help us connect functionality into our svelte application, we learned about reactivity and how everytime the board changes we will get an update of that value using the subscribe function and the shortcut `$` helper. We learned about template blocks and how to use the `#each` template block to iterate over an array and use the expression to get the values we need from the array. 

## Lesson 3: making the cells come alive

Now that we have a grid, we need to open our `src/Cell.svelte` component and export the props that we are providing as attributes.

```
<script>
export let row
export let col
export let alive
</script>
```

We want to use the alive value to toggle a class on the cell div tag. You maybe thinking to use an expression in the class attribute value like this:

```
<div class="cell {alive ? 'alive' : ''}" />
```

Which would work, with no problem, but svelte is a compiler so we can do things like this to make it a little more readable.

```
<div class="cell" class:alive />
```

This short hand will add the alive class name to the class if the alive variable is true. Neat!

When you save this component, you should now see the cells come to life, awesome! But we do not have any reactivity, we need a button to initiate the reactivity of the life engine.

Open the `src/Header.svelte` component and import the `src/Actions.svelte` component into the header component.

```
<script>
import Actions from './Actions.svelte'
...
</script>
<!-- in the second column tag add the actions component -->

<div class="column">
  <Actions />
</div>
```

Ok, save this file, and you should see three buttons, these buttons will control, the engine. We need to capture their click events and then call the functions exported from our store.

Open the `src/Actions.svelte` component and lets import these functions from our store.

```
<script>
import { start, stop, generate } from './store'
</script>
```

With svelte we can use the `on` directive to listen to any event that an element may emit. In this case, we want to handle the click event, so for each button, lets handle the click event and call respective functions from the store.

```
<button class="button is-success" on:click={start}>Start</button>
<button class="button is-danger" on:click={stop}>Stop</button>
<button class="button is-info" on:click={generate}>Generate</button>
```

Lets save these buttons, and go to the browser, if you click on the start button, you should start the see the game play, if you click the stop button, you should see the game stop and finally if you click the generate button, you will get a new board. Yayy!!! You are learning svelte!

### Summary

In this lesson we learned how to receive props from a parent component, and how to use a prop to add or remove a class to a tag using the svelte shorthand. We learned about the `on` directive and how to add a listener to the button's click event using the `on` directive and how to leverage the expression to assing it to a function handler.

## Lesson 4: Toggle a cell

The Life simulator has the ability to toggle cells so that you can make your own boards. In order to leverage this feature we need to capture the click event of the cell and invoke the life's toggle function, but this function requires the coordinates of the cell inorder to know which cell in the board to toggle.

We can import the toggle function in our `src/Cell.svelte` component and and use the exported row and col values to identify the cell. See if you can do this exercise yourself, using the things we learned from the previous lessons. 

Tasks:

* Import the toggle function from the store module.
* create a click function handler in the script tag.
* in the function handler call the imported toggle function passing the row and col as arguments
* use the `on` directive and the `click` event on the cell div to invoke the click handler

### Answer

Take a look a the `src/Cell-answer.svelte` file if you need some hints or if you got it right.


## Fin

Congrats! You completed the tutorial, this is my no means a comprehensive tutorial, but it should introduce you to some of the concepts of svelte and get a sense on how intuitive and well thought each part of the framework is. 

## Challenge

* Make the cells random colors for a psychedelic game of life
* Open up `gol.js` and play around with rule, maybe 2 neighbors generates life or 6 destroys
* Create a form to accept the size attribute and make the engine adjust size when generated
* get creative

Did you make something cool! Send me your work, tweet at @twilson63





