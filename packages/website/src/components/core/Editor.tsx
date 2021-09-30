import React from 'react'
import AceEditor, { IAceEditorProps } from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-markdown'
import 'ace-builds/src-noconflict/theme-github'

export default (props: IAceEditorProps) => (
  <AceEditor
    editorProps={{ $blockScrolling: true, tabSize: 2 }}
    wrapEnabled
    showPrintMargin={false}
    onLoad={editor => {
      editor.renderer.setPadding(10)
      editor.renderer.setScrollMargin(10)
    }}
    {...props}
  />
)
