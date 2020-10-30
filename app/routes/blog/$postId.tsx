import * as React from 'react'
import {useRouteData} from '@remix-run/react'

function Post() {
  const data = useRouteData()
  const {js, urlFiles} = data
  const fn = new Function('React', js)
  const Component = fn(React)
  // console.log(Component, urlFiles)
  return (
    <div>
      <Component />
      <pre>{js}</pre>
    </div>
  )
  // return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default Post
