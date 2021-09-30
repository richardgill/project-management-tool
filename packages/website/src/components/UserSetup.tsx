import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import TextField from '@material-ui/core/TextField'
import { Button, Typography } from '@material-ui/core'
import { UpdateUserMutation, UpdateUserMutationVariables } from '../generated/graphql'
import { UPDATE_CURRENT_USER } from '../lib/graphqlQueries'
import { FlexBox } from './core/Box'
import Form from './core/Form'

export default (props: any) => {
  const [userName, setUserName] = useState('')
  const [updateCurrentUser, updateCurrentUserResult] = useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UPDATE_CURRENT_USER)
  return (
    <FlexBox alignItems="center" justifyContent="center" flex={1}>
      <Typography variant="h6" gutterBottom>
        Select your username
      </Typography>
      <Form
        onSubmit={async () => {
          try {
            await updateCurrentUser({ variables: { user: { userName } } })
            props.history.push(props.queryParams.redirect)
          } catch (e) {
            console.error(e)
          }
        }}
      >
        <FlexBox flexDirection="row" alignItems="center" mt={4} mb={4}>
          <TextField label="Username" value={userName} onChange={e => setUserName(e.target.value)} />
          <FlexBox mt={3} ml={2}>
            <Button variant="contained" color="primary" size="small" type="submit">
              Select Username
            </Button>
          </FlexBox>
        </FlexBox>
      </Form>
      <Typography variant="body1" color="error">
        {updateCurrentUserResult.error?.graphQLErrors[0]?.message}
      </Typography>
    </FlexBox>
  )
}
