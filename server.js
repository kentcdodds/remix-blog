global.fetch = require('node-fetch')
const express = require('express')
const {createRequestHandler} = require('@remix-run/express')
const {graphql} = require('@octokit/graphql')

let app = express()

app.use(express.static('public'))

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_GRAPHQL_TOKEN}`,
  },
})

app.get('/blog/:postId/*', (req, res) => {
  res.json({success: true})
})

app.get(
  '*',
  createRequestHandler({
    getLoadContext() {
      return {graphqlWithAuth}
      // Whatever you return here will be passed as `context` to your loaders.
    },
  }),
)

app.listen(3000, () => {
  console.log('Express server started on http://localhost:3000')
})
