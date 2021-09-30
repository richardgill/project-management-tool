import { gql } from 'apollo-boost'

const RECIPE_FRAGMENT = gql`
  fragment Recipe on Recipe {
    id
    userId
    userName
    title
    slug
    markdownTemplate
    javascriptCode
  }
`

export const RECIPE_BY_USERNAME_AND_SLUG_QUERY = gql`
  query FindRecipeByNameAndSlug($userName: String!, $recipeSlug: String!) {
    recipeByNameAndSlug(userName: $userName, recipeSlug: $recipeSlug) {
      ...Recipe
    }
  }
  ${RECIPE_FRAGMENT}
`
export const RECIPE_BY_ID_QUERY = gql`
  query FindRecipeById($userId: String!, $recipeId: String!) {
    recipe(userId: $userId, recipeId: $recipeId) {
      ...Recipe
    }
  }
  ${RECIPE_FRAGMENT}
`

export const CURRENT_USER = gql`
  query CurrentUser {
    user {
      id
      userName
    }
  }
`

export const RECIPES_BY_USERNAME = gql`
  query UserRecipes($userName: String) {
    userRecipes(userName: $userName) {
      ...Recipe
    }
  }
  ${RECIPE_FRAGMENT}
`

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($userId: String!, $recipeId: String!, $recipe: RecipeUpdate!) {
    updateRecipe(userId: $userId, recipeId: $recipeId, recipe: $recipe) {
      ...Recipe
    }
  }
  ${RECIPE_FRAGMENT}
`

export const CREATE_RECIPE = gql`
  mutation CreateRecipe($userId: String) {
    createRecipe(userId: $userId) {
      ...Recipe
    }
  }
  ${RECIPE_FRAGMENT}
`

export const REMIX_RECIPE = gql`
  mutation RemixRecipe($userId: String!, $recipeId: String!) {
    remixRecipe(userId: $userId, recipeId: $recipeId) {
      ...Recipe
    }
  }
  ${RECIPE_FRAGMENT}
`

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($userId: String, $recipeId: String!) {
    deleteRecipe(userId: $userId, recipeId: $recipeId) {
      ...Recipe
    }
  }
  ${RECIPE_FRAGMENT}
`

export const UPDATE_CURRENT_USER = gql`
  mutation UpdateUser($user: UserUpdate!) {
    updateUser(user: $user) {
      id
      userName
    }
  }
`
