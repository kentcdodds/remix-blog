const {createCompiler} = require('@mdx-js/mdx')
const detectFrontmatter = require('remark-frontmatter')
const vfile = require('vfile')
const visit = require('unist-util-visit')
const remove = require('unist-util-remove')
const yaml = require('yaml')

function extractFrontmatter() {
  return function transformer(tree, file) {
    visit(tree, 'yaml', function visitor(node) {
      file.data.frontmatter = yaml.parse(node.value)
    })
    remove(tree, 'yaml')
  }
}

const mdxCompiler = createCompiler({
  remarkPlugins: [detectFrontmatter, extractFrontmatter],
})

async function gistLoader({params, url, context}) {
  const response = await fetch(`https://api.github.com/gists/${params.gist}`)
  const data = await response.json()
  const {content} = Object.values(data.files)[0]
  const file = vfile(content)

  const {
    data: {frontmatter},
  } = await mdxCompiler.process(file)

  const body = JSON.stringify({frontmatter, content})

  return new Response(body, {
    headers: {
      'cache-control': response.headers.get('cache-control'),
      'content-type': 'application/json',
    },
  })
}

module.exports = gistLoader
