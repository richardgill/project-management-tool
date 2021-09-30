import React from 'react'
import { Box as MaterialBox, BoxProps } from '@material-ui/core'

export const FlexBox = (props: BoxProps) => <MaterialBox flex="none" display="flex" flexDirection="column" {...props} />
