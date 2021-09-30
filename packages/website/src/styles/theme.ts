import { createMuiTheme } from '@material-ui/core/styles'

export const theme = createMuiTheme({
  spacing: 8,
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: 14
      }
    }
  }
})
