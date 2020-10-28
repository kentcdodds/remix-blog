import * as React from 'react'
import {Link, Outlet} from 'react-router-dom'

function Blog() {
  return (
    <div>
      <h1>Kent's Blog</h1>
      <hr />
      <Outlet />
    </div>
  )
}

export default Blog
