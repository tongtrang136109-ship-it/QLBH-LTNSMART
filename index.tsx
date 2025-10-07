import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root không tồn tại')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
