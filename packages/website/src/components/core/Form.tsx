import React from 'react'

export default (props: JSX.IntrinsicAttributes & React.ClassAttributes<HTMLFormElement> & React.FormHTMLAttributes<HTMLFormElement>) => (
  <form
    {...props}
    onSubmit={e => {
      e.preventDefault()
      if (props.onSubmit) {
        props.onSubmit(e)
      }
    }}
  />
)
