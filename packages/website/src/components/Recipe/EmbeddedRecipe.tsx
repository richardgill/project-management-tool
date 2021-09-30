import React, { useState } from 'react'
import 'github-markdown-css/github-markdown.css'
import { decreaseZoom, EmbeddedRecipeProptypes, increaseZoom, Recipe } from './Recipe'
import { TimerType } from './Timer'

export const EmbeddedRecipe = (props: EmbeddedRecipeProptypes) => {
  const [scale, setScale] = useState<number>(70)
  const [zoom, setZoom] = useState<number>(1)
  const [timers, setTimers] = useState<TimerType[]>([])

  return (
    <Recipe
      recipe={props.recipe}
      scrolls={props.scrolls}
      parameters={{ scale }}
      zoom={zoom}
      topSection={props.topSection}
      onZoomDecrease={() => setZoom(decreaseZoom(zoom))}
      onZoomIncrease={() => setZoom(increaseZoom(zoom))}
      onScaleChanged={newScale => setScale(newScale)}
      timers={timers}
      onTimersChanged={newTimers => setTimers(newTimers)}
    />
  )
}
