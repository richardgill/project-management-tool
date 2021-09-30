import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Typography
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import _ from 'lodash'
import styled from 'styled-components'
import { Howl } from 'howler'
import pluralize from 'pluralize'
import Card from '@material-ui/core/Card'
import TimerIcon from '@material-ui/icons/Timer'
import { TimerType } from './Timer'
import { FlexBox } from '../core/Box'
import { ZoomedTypography } from '../core/ZoomedTypography'

const StickyContainer = styled(Card)`
  position: sticky;
  bottom: 0;
  background-color: ${props => props.theme.palette.grey['100']};
  border: none;
`

const alarm = new Howl({
  src: [`${process.env.PUBLIC_URL}/audio/alarm.mp3`],
  autoplay: false,
  loop: true,
  volume: 1
})

const twoDigitPad = (n: number) => _.padStart(`${n}`, 2, '0')

const timeRemainingString = (timer: TimerType, currentTime: moment.Moment) => {
  const timeRemainingDuration = moment.duration(moment(timer.endTime).diff(currentTime))
  const hours = timeRemainingDuration.hours() > 0 ? `${twoDigitPad(timeRemainingDuration.hours())}h` : ''
  const minutes =
    timeRemainingDuration.hours() > 0 || timeRemainingDuration.minutes() > 0 ? `${twoDigitPad(timeRemainingDuration.minutes())}m` : ''
  const seconds = `${twoDigitPad(Math.max(timeRemainingDuration.seconds(), 0))}s`
  return `${hours}${minutes}${seconds}`
}

const Timer = (props: { zoom: number; timer: TimerType; currentTime: moment.Moment; onDelete: (timer: TimerType) => void }) => {
  const remaining = timeRemainingString(props.timer, props.currentTime)
  const timerText = `${remaining} - ${props.timer.description || 'No description'}`
  return (
    <Container>
      <FlexBox flexDirection="row" alignItems="center" pt={1} pb={1}>
        <TimerIcon />
        <ZoomedTypography style={{ flex: 1, marginLeft: 8 }} zoom={props.zoom}>
          {timerText}
        </ZoomedTypography>
        <IconButton onClick={() => props.onDelete(props.timer)}>
          <DeleteIcon />
        </IconButton>
      </FlexBox>
    </Container>
  )
}

const TimerModal = (props: { finishedTimers: TimerType[]; onClose: () => void }) => {
  const title = `Your ${pluralize('timer', props.finishedTimers.length)} ${pluralize('has', props.finishedTimers.length)} finished`
  return (
    <Dialog open={!_.isEmpty(props.finishedTimers)} onClose={() => props.onClose()}>
      <DialogTitle>
        <FlexBox flexDirection="row" alignItems="center" justifyContent="center" ml={2} mr={2}>
          <FlexBox mr={1}>
            <TimerIcon style={{ marginLeft: -2 }} />
          </FlexBox>
          {title}
        </FlexBox>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <FlexBox>
            {props.finishedTimers.map(timer => {
              const timeRemaining = timeRemainingString(timer, moment(timer.startTime))
              const timerText = `${timeRemaining} - ${timer.description}`
              return (
                <FlexBox flexDirection="row" alignItems="center" mb={2}>
                  <TimerIcon fontSize="small" style={{ marginLeft: -2, marginRight: 4 }} />
                  <Typography>{timerText}</Typography>
                </FlexBox>
              )
            })}
          </FlexBox>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose()} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const usePrevious = <T extends {}>(value: T): T | undefined => {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const isTimerFinished = (currentTime: moment.Moment) => (timer: TimerType) => currentTime.isAfter(moment(timer.endTime))

const getFinishedTimers = (timers: TimerType[], currentTime: moment.Moment) => _.filter(timers, isTimerFinished(currentTime))

export const Timers = (props: { zoom: number; timers: TimerType[]; onTimersChanged: (timers: TimerType[]) => void }) => {
  const [currentTime, setCurrentTime] = useState<moment.Moment>(moment())
  const previousTimers = usePrevious(props.timers)
  const previousCurrentTime = usePrevious(currentTime)

  useEffect(() => {
    setInterval(() => setCurrentTime(moment()), 1000)
  }, [])
  useEffect(() => {
    const finishedTimers = getFinishedTimers(props.timers, currentTime)
    const previousFinishedTimers = getFinishedTimers(previousTimers || [], previousCurrentTime || moment())

    if ((!_.isEmpty(finishedTimers) && !previousCurrentTime) || (_.isEmpty(previousFinishedTimers) && !_.isEmpty(finishedTimers))) {
      alarm.play()
    } else if (!_.isEmpty(previousFinishedTimers) && _.isEmpty(finishedTimers)) {
      alarm.stop()
    }
  }, [props.timers, currentTime])
  const sortedTimers = _.sortBy(props.timers, timer => timer.startTime)
  const finishedTimers = getFinishedTimers(props.timers, currentTime)
  return (
    <>
      <TimerModal
        finishedTimers={finishedTimers}
        onClose={() => props.onTimersChanged(_.reject(props.timers, isTimerFinished(currentTime)))}
      />
      <StickyContainer variant="outlined">
        {sortedTimers.map((timer, index) => (
          <>
            <Timer
              timer={timer}
              currentTime={currentTime}
              zoom={props.zoom}
              onDelete={timerToDelete => {
                props.onTimersChanged(_.reject(props.timers, { uuid: timerToDelete.uuid }))
              }}
            />
            {index < sortedTimers.length - 1 && <Divider />}
          </>
        ))}
      </StickyContainer>
    </>
  )
}
