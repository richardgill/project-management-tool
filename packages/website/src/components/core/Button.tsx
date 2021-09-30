import React, { useState } from 'react'
import { Button, Button as MaterialButton, ButtonProps, CircularProgress, Dialog, DialogActions, DialogTitle } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import _ from 'lodash'

const useStyles = makeStyles(theme => {
  return {
    button: {
      '&:disabled': {
        backgroundColor: theme.palette.primary.main
      }
    },
    circularProgress: {
      color: 'white'
    }
  }
})

export const LoadingButton = (props: ButtonProps) => {
  const styles = useStyles(props)
  const [isLoading, setIsLoading] = useState(false)
  return (
    <MaterialButton
      {...props}
      className={styles.button}
      disabled={isLoading}
      onClick={async event => {
        if (props.onClick) {
          setIsLoading(true)
          try {
            await props.onClick(event)
          } catch (e) {
            setIsLoading(false)
            throw e
          }
          setIsLoading(false)
        }
      }}
      startIcon={!isLoading && props.startIcon}
    >
      {isLoading ? <CircularProgress className={styles.circularProgress} color="inherit" size={25} /> : props.children}
    </MaterialButton>
  )
}

export const ConfirmButton = (
  props: ButtonProps & { onConfirm: () => void; title: string; confirmButtonProps: ButtonProps; cancelButtonProps: ButtonProps }
) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const closeDialog = () => setIsDialogOpen(false)
  return (
    <>
      <MaterialButton {..._.omit(props, 'onConfirm', 'title', 'confirmButtonProps')} onClick={() => setIsDialogOpen(true)} />
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogActions>
          <Button onClick={closeDialog} color="primary" {...props.cancelButtonProps} />
          <LoadingButton onClick={props.onConfirm} color="primary" autoFocus {...props.confirmButtonProps} />
        </DialogActions>
      </Dialog>
    </>
  )
}

ConfirmButton.defaultProps = {
  title: 'Are you sure?',
  confirmButtonProps: {
    children: 'Confirm'
  },
  cancelButtonProps: {
    children: 'Cancel'
  }
}
