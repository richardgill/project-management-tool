import React, { useState, useRef, CSSProperties } from 'react'
import _ from 'lodash'
import 'github-markdown-css/github-markdown.css'
import { Container, Typography } from '@material-ui/core'
import { Slider } from './Slider'
import Markdown from './MarkdownWithInlineComponents'
import { markdownToComponents } from '../../lib/markdownTemplater'
import { Recipe as RecipeData } from '../../generated/graphql'
import IFrameCodeRunner from './IFrameCodeRunner'
import { FlexBox } from '../core/Box'
import { Expander } from './Expander'
import { ZoomControls } from './ZoomControls'
import { TimerType } from './Timer'
import { Timers } from './Timers'
import { ZoomedTypography } from '../core/ZoomedTypography'

type RecipeFunction = (parameters: object) => object

const SCROLL_INNER_DIV_STYLES: CSSProperties = { position: 'relative', top: 0, bottom: 0, left: 0, right: 0 }

const componentNameToComponent = {
  slider: Slider,
  markdown: Markdown,
  expander: Expander
}

export type EmbeddedRecipeProptypes = {
  recipe: RecipeData
  scrolls?: boolean
  topSection?: JSX.Element
}

type RecipeProptypes = EmbeddedRecipeProptypes & {
  parameters: { scale: number }
  onScaleChanged: (scale: number) => void
  scolls?: boolean
  zoom: number
  onZoomIncrease: () => void
  onZoomDecrease: () => void
  timers: TimerType[]
  onTimersChanged: (timers: TimerType[]) => void
}

const ErrorDisplay = (props: { errorMessage: string }) => (
  <FlexBox flex={1} alignItems="center" justifyContent="center">
    <Typography variant="body1" color="error">
      Code Error
    </Typography>
    <Typography variant="body1" color="error">
      {`Error: ${props.errorMessage}`}
    </Typography>
  </FlexBox>
)

const formatErrorMessage = (error: any) => {
  if (error.columnNumber && error.lineNumber) {
    return `${error.message} at line: ${error.lineNumber - 11} column: ${error.columnNumber} `
  }
  return error.message
}

const RecipeComponent = (props: RecipeProptypes & { recipeFunction?: RecipeFunction; error?: Error }) => {
  if (props.error) {
    return <ErrorDisplay errorMessage={formatErrorMessage(props.error)} />
  }
  try {
    const recipeVars = props.recipeFunction ? props.recipeFunction(props.parameters) : {}
    const componentsToRender = markdownToComponents(props.recipe.markdownTemplate, recipeVars)
    const title = (
      <ZoomedTypography zoom={props.zoom * 1.6} variant="h2" style={{ fontWeight: 500 }}>
        {props.recipe.title}
      </ZoomedTypography>
    )

    return (
      <FlexBox style={props.scrolls ? SCROLL_INNER_DIV_STYLES : {}}>
        <FlexBox mb={4}>
          <Container>
            <FlexBox flexDirection="row" justifyContent="space-between" alignItems="center" mb={1} mt={1}>
              {props.topSection || title}
              <ZoomControls onZoomIncrease={props.onZoomIncrease} onZoomDecrease={props.onZoomDecrease} />
            </FlexBox>
            {props.topSection && title}
            {_.map(componentsToRender, (componentToRender, index) => {
              const Component = _.get(componentNameToComponent, componentToRender.component)
              return (
                <Component
                  {...componentToRender.props}
                  key={`component-${index}`}
                  zoom={props.zoom}
                  value={props.parameters.scale}
                  onValueChange={props.onScaleChanged}
                  onNewTimer={(newTimer: TimerType) => props.onTimersChanged([newTimer, ...props.timers])}
                />
              )
            })}
          </Container>
        </FlexBox>
        <Timers zoom={props.zoom} timers={props.timers} onTimersChanged={props.onTimersChanged} />
      </FlexBox>
    )
  } catch (error) {
    return <ErrorDisplay errorMessage={formatErrorMessage(error)} />
  }
}

export const Recipe = (props: RecipeProptypes) => {
  const [recipeFunction, setRecipeFunction] = useState<RecipeFunction | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const iFrameCodeRunner = useRef<HTMLIFrameElement>(null)
  return (
    <FlexBox flex={1} style={props.scrolls ? { position: 'relative', overflowY: 'auto' } : {}}>
      <IFrameCodeRunner
        ref={iFrameCodeRunner}
        code={`console.log('starting!'); ${props.recipe.javascriptCode};var recipeFunction = recipe;`}
        onLoad={() => {
          if (iFrameCodeRunner.current) {
            const vars: any = iFrameCodeRunner.current.contentWindow
            setError(vars.iframeCodeRunnerRrrorMessage)
            setRecipeFunction(() => vars.recipeFunction)
          }
        }}
      />
      {(recipeFunction || error) && <RecipeComponent {...props} error={error} recipeFunction={recipeFunction} />}
    </FlexBox>
  )
}

export const decreaseZoom = (zoom: number) => Math.max(zoom - 0.2, 0.8)
export const increaseZoom = (zoom: number) => Math.min(zoom + 0.2, 2.4)
