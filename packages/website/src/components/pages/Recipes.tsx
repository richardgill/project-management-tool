import _ from 'lodash'
import React, { useContext, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Typography } from '@material-ui/core'
import { Link } from '../core/Link'
import { UserRecipesQuery, UserRecipesQueryVariables, Recipe as RecipeData } from '../../generated/graphql'
import { RECIPES_BY_USERNAME } from '../../lib/graphqlQueries'
import Shell from '../Shell'
import QueryLoader from '../core/QueryLoader'
import { FlexBox } from '../core/Box'
import { UserContext } from '../Context'

const Recipe = (props: { recipe: RecipeData }) => {
  return (
    <Typography variant="h6">
      <Link to={`/recipes/${props.recipe.userName}/${props.recipe.slug}`}>{props.recipe.title}</Link>
    </Typography>
  )
}

const Recipes = (props: any) => {
  const { userName } = props.match.params
  const user = useContext(UserContext)
  const queryResult = useQuery<UserRecipesQuery, UserRecipesQueryVariables>(RECIPES_BY_USERNAME, {
    variables: _.omitBy({ userName }, _.isNil),
    skip: !userName && (!user || user.isAnonymous)
  })

  useEffect(() => {
    if (user && user?.isAnonymous && !user?.isLoadingUserName && !user?.userName) {
      props.history.push('/recipes/richardgill')
    }
  }, [user])

  return (
    <QueryLoader queryResult={queryResult}>
      {data => {
        return (
          <FlexBox flex={1}>
            <Typography variant="h4" gutterBottom>{`${userName || user?.userName}'s recipes:`}</Typography>
            {data.userRecipes.map(recipe => (
              <Recipe recipe={recipe} key={recipe.slug} />
            ))}
          </FlexBox>
        )
      }}
    </QueryLoader>
  )
}

export default (props: any) => {
  return (
    <Shell>
      <Recipes {...props} />
    </Shell>
  )
}
