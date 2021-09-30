import React from 'react'
import styled from 'styled-components'
import ExpansionPanelComponent from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Markdown from './MarkdownWithInlineComponents'

const ExpansionPanel = styled(ExpansionPanelComponent)`
  .MuiExpansionPanelSummary-root {
    justify-content: flex-start;
    padding: 0;
  }
  .MuiExpansionPanelDetails-root {
    padding: 0;
  }
  .MuiExpansionPanelSummary-expandIcon {
    padding-left: 0;
    padding-right: 0;
  }
  .MuiExpansionPanelSummary-content {
    flex-grow: 0;
  }
  &.MuiExpansionPanel-root.Mui-expanded {
    margin: 0;
  }
  &.MuiExpansionPanel-root::before {
    background-color: transparent;
  }
  .MuiExpansionPanelSummary-content.Mui-expanded {
    margin: inherit;
  }
  .MuiExpansionPanelSummary-root.Mui-expanded {
    min-height: auto;
  }
  .MuiCollapse-entered {
    padding-bottom: 10px;
  }
  box-shadow: none;
`

export const Expander = (props: {
  startOpen?: boolean
  contentMarkdown: string
  titleMarkdown: string
  scale: number
  zoom: number
  onScaleChange: (scale: number) => void
}) => (
  <ExpansionPanel defaultExpanded={props.startOpen}>
    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
      <Markdown zoom={props.zoom} source={props.titleMarkdown} scale={props.scale} onScaleChange={props.onScaleChange} />
    </ExpansionPanelSummary>
    <ExpansionPanelDetails>
      <Markdown zoom={props.zoom} source={props.contentMarkdown} scale={props.scale} onScaleChange={props.onScaleChange} />
    </ExpansionPanelDetails>
  </ExpansionPanel>
)
