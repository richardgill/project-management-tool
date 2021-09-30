import React from 'react'
import { html as htmlRenderer } from 'react-markdown/lib/renderers'
import _ from 'lodash'
import InfoToolTip from './InfoToolTip'
import { Timer, TimerType } from './Timer'
import { ReactMarkdown } from '../core/Markdown'

const inlineComponentNameToComponent = {
  infoToolTip: InfoToolTip,
  timer: Timer
}

export default (props: {
  source: string
  scale?: number
  onScaleChange?: (scale: number) => void
  zoom: number
  onNewTimer?: (timer: TimerType) => void
}) => (
  <ReactMarkdown
    source={props.source}
    zoom={props.zoom}
    renderers={{
      html: htmlProps => {
        const match = _.nth(htmlProps.value.match(/<span data-react-component="(.*)" \/>/) as string[], 1)
        if (match) {
          const componentConfig = JSON.parse(atob(match))
          const Component = _.get(inlineComponentNameToComponent, componentConfig.component)
          return (
            <Component
              {...componentConfig.props}
              scale={props.scale}
              onScaleChange={props.onScaleChange}
              zoom={props.zoom}
              onNewTimer={props.onNewTimer}
            />
          )
        }
        return htmlRenderer(htmlProps)
      }
    }}
  />
)
