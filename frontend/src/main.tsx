import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Import highlight.js CSS for syntax highlighting
import 'highlight.js/styles/vs2015.css' // VS Code-like dark theme

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
