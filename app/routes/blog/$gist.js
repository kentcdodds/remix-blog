import * as React from 'react'
import {useRouteData} from '@remix-run/react'

function headers({loaderHeaders}) {
  return loaderHeaders
}

function meta({data}) {
  return data.frontmatter.meta
}

function GistPost() {
  const {content} = useRouteData()
  return <pre>{content}</pre>
}

export default GistPost
export {meta, headers}
