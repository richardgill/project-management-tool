import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import MaterialLink, { LinkProps } from '@material-ui/core/Link'
import Button, { ButtonProps } from '@material-ui/core/Button'

export const Link = (props: LinkProps<RouterLink>) => <MaterialLink component={RouterLink} {...props} />

export const ButtonLink = (props: ButtonProps<RouterLink>) => <Button component={RouterLink} {...props} />
