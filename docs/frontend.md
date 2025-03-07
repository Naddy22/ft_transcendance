
# Frontend

## How HTML, CSS, and TypeScript Work Together

File	Purpose
`index.html`	Defines the structure (layout) of the page.
`styles.css`	Controls the appearance (fonts, colors, sizes, positioning).
`main.ts`	Adds interactivity (responding to clicks, sending API requests).

Example Workflow
	- In `index.html`, create a `<button>` with an `id` like `toggleRegister`.
	- In `styles.css`, define how the button looks (color, size, etc.).
	- In `main.ts`, use `document.getElementById("toggleRegister")` to select that button and make it interactive.

## HTML Elements & TypeScript Types (`HTMLDivElement`, etc.)

In TypeScript, every HTML element type has a specific type.\
Here’s a quick reference:

HTML Element	TypeScript Type
`<div>`	`HTMLDivElement`
`<button>`	`HTMLButtonElement`
`<input>`	`HTMLInputElement`
`<p>` (paragraph)	`HTMLParagraphElement`
`<pre>` (formatted text)	`HTMLPreElement`

This is why you see:
```ts
const registerForm = document.getElementById("registerForm") as HTMLDivElement;
const registerBtn = document.getElementById("registerBtn") as HTMLButtonElement;
const registerResponse = document.getElementById("registerResponse") as HTMLParagraphElement;
```

- `registerForm` is a `<div>` → so we cast it to `HTMLDivElement`
- `registerBtn` is a `<button>` → so we cast it to `HTMLButtonElement`
- `registerResponse` is a `<p>` → so we cast it to `HTMLParagraphElement`


👉 You can find more about these in the official TypeScript DOM docs:\
[MDN HTML DOM Interfaces](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)


---

## How `styles.css` Works
Each CSS rule applies to an element in `index.html` using:

- Tag names (`body`, `button`, `div`)
- Classes (`.hidden`)
- IDs (`#registerForm`)

Example\
If `index.html` has:
```html
<div id="registerForm">Register Form</div>
```

You can style it in `styles.css` like:
```css
#registerForm {
    background-color: lightblue;
    padding: 10px;
    border: 1px solid black;
}
```
📌 You can use `id` (`#registerForm`) or `class` (`.hidden`) to style elements.

---

## `display: none;` vs. `.hidden` Class

- `display: none;` completely hides an element (it takes up no space).
- `.hidden` is a CSS class that we apply/remove dynamically in `main.ts`.

Example
```css
.hidden {
    display: none;
}
```

And in `main.ts`, we toggle this class to show/hide elements:
```ts
registerForm.classList.toggle("hidden");
```
👉 This works because `classList.toggle()` automatically adds/removes `hidden`.


---

## `document.getElementById()` & HTML Element Values

### How `HTMLInputElement.value` Works

For `<input>`, you use `.value` to get the text entered by the user:
```ts
const regUsername = document.getElementById("regUsername") as HTMLInputElement;
console.log(regUsername.value); // Logs what the user typed
```

### How `HTMLParagraphElement.textContent` Works
For `<p>` (paragraphs), we use `.textContent` to update the text inside:
```ts
const registerResponse = document.getElementById("registerResponse") as HTMLParagraphElement;
registerResponse.textContent = "✅ Success!";
```

---

## `addEventListener("click")` & Button Actions

Here is how `addEventListener("click", ...)` works:
```ts
toggleRegister.addEventListener("click", () => {
    registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
});
```

- When you click `toggleRegister` → it checks if `registerForm` is hidden.
- If it was hidden, it becomes visible.
- If it was visible, it hides again.

---

## Sections (`<div>` Elements)

A `<div>` (used as `HTMLDivElement`) is a container for grouping elements.

Example in `index.html`:
```html
<div id="registerForm">
    <h2>Register</h2>
    <input type="text" id="regUsername">
    <button id="registerBtn">Register</button>
</div>
```
👉 This entire section is wrapped inside a `<div>` (which we control in `main.ts`).


---

## Resources to Learn More

### MDN (Best for Beginners)
- CSS Basics: [MDN CSS Guide](https://developer.mozilla.org/en-US/docs/Learn/CSS)
- DOM & JavaScript: [MDN DOM Guide](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- Input & Form Handling: [MDN Forms](https://developer.mozilla.org/en-US/docs/Learn/Forms)

### TypeScript & HTML DOM
- TypeScript Docs: [TypeScript Docs](https://www.typescriptlang.org/docs/)
- DOM Types (like HTMLButtonElement): [TypeScript Docs - DOM Manipulation](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html)

---
