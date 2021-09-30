import React, { useContext, useState } from 'react'
import { AppBar, Toolbar, makeStyles, IconButton, Menu, MenuItem } from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import styled from 'styled-components'
import Container from '@material-ui/core/Container'
import AddIcon from '@material-ui/icons/Add'
import AccountCircle from '@material-ui/icons/AccountCircle'
import firebase from 'firebase'
import { useTheme } from '@material-ui/core/styles'
import Div from './core/Div'
import { FlexBox } from './core/Box'
import { Link, ButtonLink } from './core/Link'
import { UserContext } from './Context'

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: 10
  },
  title: {
    flexGrow: 1
  },
  container: {
    display: 'flex',
    height: '100%'
  }
}))

const FullScreenContainer = styled(Div)`
  flex: 1;
`

const MenuLink = styled(Link)`
  color: inherit;
  &:hover {
    text-decoration: none;
  }
`

type ShellContainerComponentProps = { children: React.ReactNode; flex?: number }

export const DefaultShellContainerComponent = (props: ShellContainerComponentProps) => {
  const classes = useStyles()
  return (
    <FlexBox flex={props.flex !== undefined ? props.flex : 1} mt={2}>
      <Container className={classes.container}>{props.children}</Container>
    </FlexBox>
  )
}

const Shell = (props: { children: React.ReactNode; shellContainerComponent: (props: ShellContainerComponentProps) => JSX.Element }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const user = useContext(UserContext)
  const [anchorElement, setAnchorElement] = useState(null)
  const onMenuClose = () => {
    setAnchorElement(null)
  }
  const onMenuClicked = (event: any) => {
    setAnchorElement(event.currentTarget)
  }
  const ShellContainerComponent = props.shellContainerComponent
  return (
    <FullScreenContainer>
      <AppBar position="static">
        <Container>
          <Toolbar disableGutters>
            <Link className={classes.title} to="/" underline="none" color="inherit" variant="h6">
              {!isSmall ? 'Programmable Recipes' : ''}
            </Link>
            <ButtonLink to="/recipe/new" variant="contained" color="secondary" startIcon={<AddIcon />}>
              New Recipe
            </ButtonLink>
            <div>
              <IconButton onClick={onMenuClicked} color="inherit">
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElement}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                open={Boolean(anchorElement)}
                onClose={onMenuClose}
              >
                <MenuItem>
                  <MenuLink to="/how-it-works">How it works</MenuLink>
                </MenuItem>
                <MenuItem>
                  <MenuLink to="/feedback">{'Feedback & Questions'}</MenuLink>
                </MenuItem>
                {user?.isAnonymous === false ? (
                  <MenuItem
                    onClick={() => {
                      firebase.auth().signOut()
                      onMenuClose()
                      window.location.href = '/'
                    }}
                  >
                    Logout
                  </MenuItem>
                ) : (
                  <MenuItem>
                    <MenuLink to="/signup">Sign Up</MenuLink>
                  </MenuItem>
                )}
              </Menu>
            </div>
          </Toolbar>
        </Container>
      </AppBar>
      <ShellContainerComponent>{props.children}</ShellContainerComponent>
    </FullScreenContainer>
  )
}
Shell.defaultProps = { shellContainerComponent: DefaultShellContainerComponent }
export default Shell
