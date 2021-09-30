import React from 'react'
import moment from 'moment'
import TimerIcon from '@material-ui/icons/Timer'
import { uuid } from 'uuidv4'
import styled from 'styled-components'
import { FlexBox as FlexBoxComponent } from '../core/Box'
import { ReactMarkdown } from '../core/Markdown'
import { zoomIconFontSize } from '../../lib/zoom'

const FlexBox = styled(FlexBoxComponent)`
  cursor: pointer;
  vertical-align: top;
`

const StyledTimerIcon = styled(TimerIcon)`
  font-size: ${(props: { zoom: number }) => zoomIconFontSize(props.zoom)};
  color: #0366d6;
  margin-left: 4px;
`
export interface TimerType {
  uuid: string
  startTime: string
  endTime: string
  durationSeconds: number
  description: string
}

export const Timer = (props: {
  zoom: number
  minutes: number
  seconds: number
  hours: number
  text: string
  description: string
  onNewTimer: (timer: TimerType) => void
}) => {
  return (
    <FlexBox
      display="inline-flex"
      flexDirection="row"
      alignItems="center"
      onClick={e => {
        const startTime = moment().utc()
        const durationSeconds = props.seconds + props.minutes * 60 + props.hours * 60 * 60
        const endTime = startTime.clone().add(durationSeconds, 'seconds')
        const timer = {
          uuid: uuid(),
          startTime: startTime.format(),
          endTime: endTime.format(),
          durationSeconds,
          description: props.description
        }
        props.onNewTimer(timer)
        e.preventDefault()
      }}
    >
      <ReactMarkdown zoom={props.zoom} source={`[${props.text}](/)`} />
      <StyledTimerIcon zoom={props.zoom} />
    </FlexBox>
  )
}
