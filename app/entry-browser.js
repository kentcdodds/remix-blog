import React from 'react'
import ReactDOM from 'react-dom'
import Remix from '@remix-run/react/browser'

import App from './app'

ReactDOM.hydrate(
  <Remix>
    <App />
  </Remix>,
  document,
)
