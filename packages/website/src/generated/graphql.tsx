export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

export type Mutation = {
  __typename?: 'Mutation'
  createRecipe: Recipe
  deleteRecipe: Recipe
  remixRecipe: Recipe
  updateRecipe: Recipe
  updateUser: User
}

export type MutationCreateRecipeArgs = {
  recipe?: Maybe<RecipeUpdate>
  userId?: Maybe<Scalars['String']>
}

export type MutationDeleteRecipeArgs = {
  recipeId: Scalars['String']
  userId?: Maybe<Scalars['String']>
}

export type MutationRemixRecipeArgs = {
  recipeId: Scalars['String']
  userId: Scalars['String']
}

export type MutationUpdateRecipeArgs = {
  recipe: RecipeUpdate
  recipeId: Scalars['String']
  userId?: Maybe<Scalars['String']>
}

export type MutationUpdateUserArgs = {
  user: UserUpdate
  userId?: Maybe<Scalars['String']>
}

export type Query = {
  __typename?: 'Query'
  recipe: Recipe
  recipeByNameAndSlug: Recipe
  user: User
  userRecipes: Array<Recipe>
}

export type QueryRecipeArgs = {
  recipeId: Scalars['String']
  userId: Scalars['String']
}

export type QueryRecipeByNameAndSlugArgs = {
  recipeSlug: Scalars['String']
  userName: Scalars['String']
}

export type QueryUserArgs = {
  userId?: Maybe<Scalars['String']>
}

export type QueryUserRecipesArgs = {
  userName?: Maybe<Scalars['String']>
}

export type Recipe = {
  __typename?: 'Recipe'
  id: Scalars['String']
  javascriptCode: Scalars['String']
  markdownTemplate: Scalars['String']
  slug: Scalars['String']
  title: Scalars['String']
  userId: Scalars['String']
  userName?: Maybe<Scalars['String']>
}

export type RecipeUpdate = {
  javascriptCode?: Maybe<Scalars['String']>
  markdownTemplate?: Maybe<Scalars['String']>
  slug?: Maybe<Scalars['String']>
  title?: Maybe<Scalars['String']>
}

export type User = {
  __typename?: 'User'
  id: Scalars['String']
  userName?: Maybe<Scalars['String']>
}

export type UserUpdate = {
  userName?: Maybe<Scalars['String']>
}

export type RecipeFragment = {
  __typename?: 'Recipe'
  id: string
  userId: string
  userName?: string | null | undefined
  title: string
  slug: string
  markdownTemplate: string
  javascriptCode: string
}

export type FindRecipeByNameAndSlugQueryVariables = Exact<{
  userName: Scalars['String']
  recipeSlug: Scalars['String']
}>

export type FindRecipeByNameAndSlugQuery = {
  __typename?: 'Query'
  recipeByNameAndSlug: {
    __typename?: 'Recipe'
    id: string
    userId: string
    userName?: string | null | undefined
    title: string
    slug: string
    markdownTemplate: string
    javascriptCode: string
  }
}

export type FindRecipeByIdQueryVariables = Exact<{
  userId: Scalars['String']
  recipeId: Scalars['String']
}>

export type FindRecipeByIdQuery = {
  __typename?: 'Query'
  recipe: {
    __typename?: 'Recipe'
    id: string
    userId: string
    userName?: string | null | undefined
    title: string
    slug: string
    markdownTemplate: string
    javascriptCode: string
  }
}

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>

export type CurrentUserQuery = { __typename?: 'Query'; user: { __typename?: 'User'; id: string; userName?: string | null | undefined } }

export type UserRecipesQueryVariables = Exact<{
  userName?: Maybe<Scalars['String']>
}>

export type UserRecipesQuery = {
  __typename?: 'Query'
  userRecipes: Array<{
    __typename?: 'Recipe'
    id: string
    userId: string
    userName?: string | null | undefined
    title: string
    slug: string
    markdownTemplate: string
    javascriptCode: string
  }>
}

export type UpdateRecipeMutationVariables = Exact<{
  userId: Scalars['String']
  recipeId: Scalars['String']
  recipe: RecipeUpdate
}>

export type UpdateRecipeMutation = {
  __typename?: 'Mutation'
  updateRecipe: {
    __typename?: 'Recipe'
    id: string
    userId: string
    userName?: string | null | undefined
    title: string
    slug: string
    markdownTemplate: string
    javascriptCode: string
  }
}

export type CreateRecipeMutationVariables = Exact<{
  userId?: Maybe<Scalars['String']>
}>

export type CreateRecipeMutation = {
  __typename?: 'Mutation'
  createRecipe: {
    __typename?: 'Recipe'
    id: string
    userId: string
    userName?: string | null | undefined
    title: string
    slug: string
    markdownTemplate: string
    javascriptCode: string
  }
}

export type RemixRecipeMutationVariables = Exact<{
  userId: Scalars['String']
  recipeId: Scalars['String']
}>

export type RemixRecipeMutation = {
  __typename?: 'Mutation'
  remixRecipe: {
    __typename?: 'Recipe'
    id: string
    userId: string
    userName?: string | null | undefined
    title: string
    slug: string
    markdownTemplate: string
    javascriptCode: string
  }
}

export type DeleteRecipeMutationVariables = Exact<{
  userId?: Maybe<Scalars['String']>
  recipeId: Scalars['String']
}>

export type DeleteRecipeMutation = {
  __typename?: 'Mutation'
  deleteRecipe: {
    __typename?: 'Recipe'
    id: string
    userId: string
    userName?: string | null | undefined
    title: string
    slug: string
    markdownTemplate: string
    javascriptCode: string
  }
}

export type UpdateUserMutationVariables = Exact<{
  user: UserUpdate
}>

export type UpdateUserMutation = {
  __typename?: 'Mutation'
  updateUser: { __typename?: 'User'; id: string; userName?: string | null | undefined }
}
