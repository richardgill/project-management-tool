import React, { useEffect } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { CircularProgress, Typography } from '@material-ui/core'
import { CREATE_RECIPE, RECIPES_BY_USERNAME } from '../../lib/graphqlQueries'
import { CreateRecipeMutation, CreateRecipeMutationVariables } from '../../generated/graphql'
import Shell from '../Shell'
import { FlexBox } from '../core/Box'

const LoadingIndicator = () => (
  <FlexBox flex={1} alignItems="center" justifyContent="center">
    <Typography gutterBottom variant="subtitle1">
      Creating a new recipe...
    </Typography>
    <CircularProgress />
  </FlexBox>
)

export default (props: any) => {
  const [createRecipe] = useMutation<CreateRecipeMutation, CreateRecipeMutationVariables>(CREATE_RECIPE, {
    refetchQueries: [{ query: RECIPES_BY_USERNAME }]
  })

  useEffect(() => {
    ;(async () => {
      const createRecipeResponse = await createRecipe()
      const recipe = createRecipeResponse.data?.createRecipe
      props.history.push(`/recipes/${recipe?.userId}/${recipe?.id}/edit`)
    })()
  }, [])

  return (
    <Shell>
      <LoadingIndicator />
    </Shell>
  )
}
