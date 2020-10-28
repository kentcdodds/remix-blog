import * as React from 'react'
import {Link, Outlet} from 'react-router-dom'

function Blog() {
  return (
    <div>
      <h1>Kent's Blog</h1>
      <Link to="dd15c0da62f7e1f45a539ec460a37efc">Test post</Link>
      <hr />
      <Outlet />
    </div>
  )
}

export default Blog
