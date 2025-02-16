
# Frontend Info

- [**TypeScript**](https://www.typescriptlang.org/) is a superset of JavaScript with added static typing
- [Why TypeScript Is Now the Best Way to Write Front-End](https://ankitakapoor23.medium.com/why-typescript-is-now-the-best-way-to-write-front-end-dbc0ba491ed2)


## tsc - TypeScript Compiler

**tsc** is a tool that converts TypeScript code (.ts files) into executable JavaScript code (.js files) that can be run by web browsers 
essentially allowing developers to write code with better type checking and error detection 
while still maintaining compatibility with standard JavaScript environments

By using TypeScript with the tsc compiler, 
developers can catch potential errors early in the development process due to the static typing system, 
leading to cleaner and more reliable code. 

To compile TypeScript code:
```bash
tsc
```


## Understanding Vite

> https://vite.dev/guide/api-hmr


The frontend is using **Vite**, a modern frontend build tool.  
It is faster than Webpack and provides a great development experience with Hot Module Replacement (HMR).

- **Vite serves your frontend locally at** http://localhost:5173/
- **It compiles TypeScript and optimizes assets**
- **We run the frontend with** `npm run dev`

In production, we will need to **build** the frontend:
```
npm run build
```

This will generate **optimized static files** in the frontend/dist/ folder, 
which can be served via Nginx or a backend.


Vite is considered a JavaScript module bundler, \
meaning it takes your code and dependencies and combines them into optimized bundles ready for the browser to execute; \
It's particularly known for its fast build times due to its reliance on native browser ES modules during development. \
[Info on this here!](https://www.axelerant.com/blog/vite-vs-webpack-the-best-react-bundler#:~:text=Vite%20JS%20is%20a%20very,up%20compilation%2C%20especially%20during%20development.)

