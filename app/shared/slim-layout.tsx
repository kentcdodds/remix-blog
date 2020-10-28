import * as React from 'react'
import {Link} from 'react-router-dom'

function SlimLayout({
  children,
  ...props
}: React.PropsWithChildren<{}>): React.ReactNode {
  console.log(props)
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">kentcdodds.com</Link>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
      <footer>Join the newsletter!</footer>
    </div>
  )
}

export {SlimLayout}
