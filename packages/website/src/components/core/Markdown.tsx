import React from 'react'
import ReactMarkdownComponent, { ReactMarkdownProps } from 'react-markdown'
import styled from 'styled-components'

const StyledReactMarkdown = styled(ReactMarkdownComponent)`
  font-size: ${(props: { zoom: number }) => props.zoom * 16}px;
  pre code {
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
  }
`

export const ReactMarkdown = (props: ReactMarkdownProps & { zoom: number }) => {
  return <StyledReactMarkdown className="markdown-body" escapeHtml={false} {...props} />
}
ReactMarkdown.defaultProps = {
  zoom: 1
}
