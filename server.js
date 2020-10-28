global.fetch = require('node-fetch')
const express = require('express')
const {createRequestHandler} = require('@remix-run/express')

let app = express()

app.use(express.static('public'))

app.get(
  '*',
  createRequestHandler({
    getLoadContext() {
      // Whatever you return here will be passed as `context` to your loaders.
    },
  }),
)

app.listen(3000, () => {
  console.log('Express server started on http://localhost:3000')
})
