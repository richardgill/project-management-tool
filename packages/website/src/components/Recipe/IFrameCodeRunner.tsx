import React from 'react'

const wrapJavascript = (code: String) => {
  return `<html>
    <head>
      <script>
        window.onerror = function (msg, url, lineNo, columnNo, error) {
          window.iframeCodeRunnerRrrorMessage = error
          return false;
        }
      </script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.10/lodash.js"></script>
    </head>
    <body>
      <script>${code}</script>
    </body>
  </html>`
}

export default React.forwardRef((props: { code: String; onLoad: () => void }, ref: any) => {
  return (
    <iframe ref={ref} title="iframe-code-runner" srcDoc={wrapJavascript(props.code)} onLoad={props.onLoad} style={{ display: 'none' }} />
  )
})
