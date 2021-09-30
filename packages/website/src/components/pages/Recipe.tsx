import React, { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import EditIcon from '@material-ui/icons/Edit'
import { Box } from '@material-ui/core'
import NoSleep from 'nosleep.js'
import DeleteIcon from '@material-ui/icons/Delete'
import { ButtonLink } from '../core/Link'
import { ConfirmButton } from '../core/Button'
import {
  DeleteRecipeMutation,
  DeleteRecipeMutationVariables,
  FindRecipeByNameAndSlugQuery,
  FindRecipeByNameAndSlugQueryVariables
} from '../../generated/graphql'
import { DELETE_RECIPE, RECIPE_BY_USERNAME_AND_SLUG_QUERY, RECIPES_BY_USERNAME } from '../../lib/graphqlQueries'
import { FullScreenRecipe } from '../Recipe/FullScreenRecipe'
import QueryLoader from '../core/QueryLoader'
import Shell from '../Shell'
import { FlexBox } from '../core/Box'
import { UserContext } from '../Context'
import { RemixButton } from '../Recipe/RemixButton'

const FullScreenContainer = ({ children }: { children: React.ReactNode }) => <FlexBox flex={1}>{children}</FlexBox>

const noSleep = new NoSleep()

export default (props: any) => {
  const { userName, recipeSlug }: { userName: string; recipeSlug: string } = props.match.params

  const user = useContext(UserContext)
  const queryResult = useQuery<FindRecipeByNameAndSlugQuery, FindRecipeByNameAndSlugQueryVariables>(RECIPE_BY_USERNAME_AND_SLUG_QUERY, {
    variables: { userName, recipeSlug }
  })
  const [deleteRecipe] = useMutation<DeleteRecipeMutation, DeleteRecipeMutationVariables>(DELETE_RECIPE, {
    refetchQueries: [{ query: RECIPES_BY_USERNAME }]
  })
  useEffect(() => {
    const scrollListener = () => noSleep.enable()
    window.addEventListener('scroll', scrollListener)
    return () => {
      noSleep.disable()
      window.removeEventListener('scroll', scrollListener)
    }
  }, [])

  return (
    <Shell shellContainerComponent={FullScreenContainer}>
      <QueryLoader queryResult={queryResult}>
        {data => {
          const recipe = data.recipeByNameAndSlug
          const topSection = (
            <Box>
              {user?.uid === data.recipeByNameAndSlug.userId ? (
                <FlexBox flexDirection="row">
                  <ButtonLink
                    variant="contained"
                    startIcon={<EditIcon />}
                    color="primary"
                    to={`/recipes/${recipe.userId}/${recipe.id}/edit`}
                  >
                    Edit
                  </ButtonLink>
                  <FlexBox ml={1}>
                    <ConfirmButton
                      startIcon={<DeleteIcon />}
                      color="secondary"
                      title="Delete your recipe?"
                      onConfirm={async () => {
                        await deleteRecipe({ variables: { userId: recipe.userId, recipeId: recipe.id } })
                        props.history.push('/')
                      }}
                      confirmButtonProps={{ startIcon: <DeleteIcon />, color: 'secondary', children: 'Delete' }}
                    >
                      Delete
                    </ConfirmButton>
                  </FlexBox>
                </FlexBox>
              ) : (
                <RemixButton recipe={recipe} history={props.history} />
              )}
            </Box>
          )
          return (
            <FlexBox
              flex={1}
              mt={1}
              onMouseDown={() => {
                noSleep.enable()
              }}
            >
              <FullScreenRecipe recipe={data.recipeByNameAndSlug} history={props.history} topSection={topSection} />
            </FlexBox>
          )
        }}
      </QueryLoader>
    </Shell>
  )
}
