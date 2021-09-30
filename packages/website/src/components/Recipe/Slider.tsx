import React from 'react'
import MaterialSlider from '@material-ui/core/Slider'
import styled from 'styled-components'
import _ from 'lodash'

const ParameterContainer = styled.div`
  display: flex;
  @media screen and (min-width: 480px) {
    flex-direction: row;
  }
`
const SliderContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media screen and (min-width: 480px) {
    max-width: 200px;
    margin-right: 30px;
  }
`

export const Slider = (props: { min: number; max: number; step: number; value: number; onValueChange: (value: number) => void }) => (
  <ParameterContainer>
    {!_.isNil(props.value) && (
      <SliderContainer>
        <MaterialSlider
          min={props.min}
          max={props.max}
          value={props.value}
          onChange={(event, newValue) => props.onValueChange(newValue as number)}
          aria-labelledby="scale-slider"
          step={props.step}
          valueLabelDisplay="off"
        />
      </SliderContainer>
    )}
  </ParameterContainer>
)
