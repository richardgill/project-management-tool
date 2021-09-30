import React from 'react'
import { History } from 'history'
import { useMutation } from '@apollo/react-hooks'
import { LoadingButton } from '../core/Button'
import { Recipe, RemixRecipeMutation, RemixRecipeMutationVariables } from '../../generated/graphql'
import { REMIX_RECIPE } from '../../lib/graphqlQueries'

export const RemixButton = (props: { recipe: Recipe; history: History }) => {
  const [remixRecipe] = useMutation<RemixRecipeMutation, RemixRecipeMutationVariables>(REMIX_RECIPE)

  return (
    <LoadingButton
      variant="contained"
      color="primary"
      onClick={async () => {
        const result = await remixRecipe({ variables: { userId: props.recipe.userId, recipeId: props.recipe.id } })
        const newRecipe = result.data?.remixRecipe
        props.history.push(`/recipes/${newRecipe?.userId}/${newRecipe?.id}/edit`)
      }}
    >
      Remix Recipe
    </LoadingButton>
  )
}
