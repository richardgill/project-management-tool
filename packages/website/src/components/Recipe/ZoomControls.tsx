import React from 'react'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import { IconButton } from '@material-ui/core'
import { FlexBox } from '../core/Box'

export const ZoomControls = (props: { onZoomIncrease: () => void; onZoomDecrease: () => void }) => {
  return (
    <FlexBox flexDirection="row">
      <IconButton onClick={() => props.onZoomDecrease()}>
        <ZoomOutIcon fontSize="large" />
      </IconButton>
      <IconButton onClick={() => props.onZoomIncrease()}>
        <ZoomInIcon fontSize="large" />
      </IconButton>
    </FlexBox>
  )
}
