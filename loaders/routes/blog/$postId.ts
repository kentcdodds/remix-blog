import type {DataLoader} from '@remix-run/core'
const path = require('path')
const rollup = require('rollup')
const {babel: rollupBabel} = require('@rollup/plugin-babel')
const {terser} = require('rollup-plugin-terser')
const {createCompiler} = require('@mdx-js/mdx')
const detectFrontmatter = require('remark-frontmatter')
const vfile = require('vfile')
const visit = require('unist-util-visit')
const remove = require('unist-util-remove')
const yaml = require('yaml')

type DynamicObj = {[name: string]: string}
const postLoader: DataLoader = async ({params, context}) => {
  const {graphqlWithAuth} = context
  const baseDir = `content/blog/${params.postId}`
  const allFiles = await downloadDirecotry(baseDir)
  const moduleById: DynamicObj = {}
  const urlFiles: DynamicObj = {}
  let main
  for (const file of allFiles) {
    if (file.url) {
      urlFiles[file.path] = file.url
      continue
    }
    if (!file.text) continue
    if (file.path.startsWith(`${baseDir}/index`)) main = file
    const id = path.join(__dirname, file.path)
    moduleById[id] = file.text
  }
  if (!main) throw new Error('This directory has no index')

  let entryCode = main.text as string
  let entryPath = path.join(__dirname, main.path)
  let frontmatter
  if (main.path.endsWith('.mdx')) {
    const compiledMdx = await mdxCompiler.process(main.text)
    entryCode = compiledMdx.contents
    frontmatter = compiledMdx.data.frontmatter
    entryPath = path.join(__dirname, baseDir, './index.mdx.js')
  }
  moduleById[entryPath] = entryCode

  const result = await bundleCode(entryCode, entryPath, moduleById)

  return {
    js: `
${result[0].code}
Component.frontmatter = ${JSON.stringify(frontmatter ?? {})}
return Component;
  `.trim(),
    urlFiles,
  }
}

module.exports = postLoader

type fileInfoType = {
  type: string
  path: string
  download_url: string
}
type downloadedFiles = Array<{text?: string; path: string; url?: string}>
async function downloadDirecotry(dir: string): Promise<downloadedFiles> {
  const json = await (
    await fetch(
      `https://api.github.com/repos/kentcdodds/kentcdodds.com/contents/${dir}`,
    )
  ).json()
  return Promise.all(
    json.flatMap(async (fileInfo: fileInfoType) => {
      if (fileInfo.type === 'file') {
        const res = await fetch(fileInfo.download_url)
        const contentType = res.headers.get('content-type') ?? 'text/plain'
        if (contentType.includes('text/plain')) {
          const text = await res.text()
          return {path: fileInfo.path, text}
        } else if (contentType.includes('image/')) {
          return {path: fileInfo.path, contentType, url: fileInfo.download_url}
        }
      } else if (fileInfo.type === 'dir') {
        return downloadDirecotry(fileInfo.path)
      } else {
        throw new Error(`Unsupported type: ${fileInfo.type} ${fileInfo.path}`)
      }
    }),
  )
}

function extractFrontmatter() {
  return function transformer(tree: any, file: any) {
    visit(tree, 'yaml', function visitor(node: any) {
      file.data.frontmatter = yaml.parse(node.value)
    })
    remove(tree, 'yaml')
  }
}
const mdxCompiler = createCompiler({
  remarkPlugins: [detectFrontmatter, extractFrontmatter],
})

async function bundleCode(code: string, entry: string, moduleById: DynamicObj) {
  const inputOptions = {
    external: ['react', 'react-dom'],
    input: entry,
    plugins: [
      {
        resolveId(importee: string, importer: string) {
          if (!importer) return importee
          if (importee[0] !== '.') return false
          let resolved = path
            .resolve(path.dirname(importer), importee)
            .replace(/^\.\//, '')
          for (const ext of ['', '.js', '.ts', '.tsx']) {
            const withExt = `${resolved}${ext}`
            if (moduleById[withExt]) return withExt
          }
          throw new Error(`Could not resolve '${importee}' from '${importer}'`)
        },
        load: function (id: string) {
          return moduleById[id]
        },
      },
      rollupBabel({
        babelHelpers: 'inline',
        configFile: false,
        exclude: /node_modules/,
        extensions: ['.js', '.ts', '.tsx', '.md', '.mdx'],
        presets: [
          '@babel/preset-react',
          ['@babel/preset-env', {targets: {node: '12'}}],
          ['@babel/preset-typescript', {allExtensions: true, isTSX: true}],
        ],
      }),
      terser(),
    ],
  }

  const outputOptions = {
    name: 'Component',
    format: 'iife',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  }

  const bundle = await rollup.rollup(inputOptions)
  const {output} = await bundle.generate(outputOptions)
  return output
}
