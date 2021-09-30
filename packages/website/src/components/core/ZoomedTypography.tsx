import styled from 'styled-components'
import { Typography } from '@material-ui/core'

export const ZoomedTypography = styled(Typography)`
  font-size: ${(props: { zoom: number }) => props.zoom * 100}%;
`
