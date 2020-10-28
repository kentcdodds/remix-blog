import React from 'react'
import {Meta, Scripts, Styles, Routes, useGlobalData} from '@remix-run/react'

function App() {
  const data = useGlobalData()
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Styles />
      </head>
      <body>
        <Routes />
        <Scripts />
        <footer>
          <p>This is awesome!!! {data.date}</p>
        </footer>
      </body>
    </html>
  )
}

export default App
