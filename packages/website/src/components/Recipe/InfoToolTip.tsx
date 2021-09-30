import React from 'react'
import { Tooltip } from '@material-ui/core'
import InfoIcon from '@material-ui/icons/Info'
import styled from 'styled-components'
import { zoomIconFontSize } from '../../lib/zoom'

const StyledTooltip = styled(Tooltip)`
  margin-bottom: -5px;
  font-size: ${(props: { zoom: number }) => zoomIconFontSize(props.zoom)};
`

export default (props: { text: string; zoom: number }) => {
  return (
    <StyledTooltip zoom={props.zoom} title={props.text} aria-label={props.text} enterTouchDelay={200}>
      <InfoIcon />
    </StyledTooltip>
  )
}
