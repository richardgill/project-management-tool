import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import _ from 'lodash'
import uri from 'urijs'
import 'github-markdown-css/github-markdown.css'
import { History } from 'history'
import { Recipe as RecipeData } from '../../generated/graphql'
import { FlexBox } from '../core/Box'
import { decreaseZoom, increaseZoom, Recipe } from './Recipe'
import { TimerType } from './Timer'

export const FullScreenRecipe = (props: { recipe: RecipeData; history: History; topSection: JSX.Element }) => {
  const [scale, setScale] = useState<number | null>(null)
  const [zoom, setZoom] = useState<number>(1)
  const [timers, setTimers] = useState<TimerType[]>([])
  const updateZoom = (newZoom: number) => {
    setZoom(newZoom)
    localStorage.setItem('zoom', JSON.stringify(newZoom))
  }
  const uniqueSlug = `${props.recipe.userId}/${props.recipe.slug}`
  const parametersKey = `${uniqueSlug}/parameters`
  const timersKey = `${uniqueSlug}/timers`

  const updateTimers = (newTimers: TimerType[]) => {
    setTimers(newTimers)
    localStorage.setItem(timersKey, JSON.stringify(newTimers))
  }

  const updateUrl = () => {
    const parameters = {
      scale
    }
    localStorage.setItem(parametersKey, JSON.stringify(parameters))
    props.history.replace({
      ...props.history.location,
      search: uri.buildQuery(parameters)
    })
  }

  useEffect(() => {
    if (scale) {
      updateUrl()
    }
  }, [scale])

  useEffect(() => {
    setZoom(parseFloat(localStorage.getItem('zoom') || '1'))
    const localStorageTimers = JSON.parse(localStorage.getItem(timersKey) || '[]')
    const localStorageParametersRaw = localStorage.getItem(parametersKey)
    const localStorageParameters = localStorageParametersRaw ? JSON.parse(localStorageParametersRaw) : {}
    const queryParameters = uri.parseQuery(props.history.location.search)

    const scaleParam = _.parseInt(_.get(queryParameters, 'scale'))
    setScale(scaleParam || localStorageParameters.scale || 70)
    setTimers(localStorageTimers)
  }, [])

  return (
    <FlexBox>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{props.recipe.title}</title>
      </Helmet>
      <Recipe
        recipe={props.recipe}
        zoom={zoom}
        onZoomDecrease={() => updateZoom(decreaseZoom(zoom))}
        onZoomIncrease={() => updateZoom(increaseZoom(zoom))}
        parameters={{ scale: scale || 70 }}
        topSection={props.topSection}
        timers={timers}
        onTimersChanged={newTimers => updateTimers(newTimers)}
        onScaleChanged={newScale => setScale(newScale)}
      />
    </FlexBox>
  )
}
