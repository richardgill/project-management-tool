import _ from 'lodash'
import { ApolloError, AuthenticationError } from 'apollo-server-express'
import { getUserByUserNameWithRecipes, updateUser, updateRecipe, createRecipe, getUserByIdWithRecipes, getUserById, deleteRecipe } from '../firebase/queries'
import { FBUser, FBRecipe } from '../firebase/firebaseTypes'
import { recipeSchema, userSchema } from '../firebase/schema'
import { Context } from './types'
import { generateSampleRecipe, findNonClashingSlug } from '../lib/sampleRecipes'
import { RecipeUpdate, Resolvers } from '../generated/graphql'

/* eslint-disable no-param-reassign */
const validateRecipeRequest = (recipe: NonNullable<RecipeUpdate>, userId: string, context: Context) => {
  const validationResult = recipeSchema.validate(recipe)
  if (validationResult.error) {
    throw new ApolloError(validationResult.error.message)
  }
  if (userId !== context.user.uid) {
    throw new AuthenticationError(`User ${context.user.uid} cannot update user ${userId}'s recipe`)
  }
  return userId
}

const buildRecipe = (user: FBUser, recipe: FBRecipe) => {
  return { ...recipe, userName: user.userName, userId: user.id }
}

const recipeQuery = async (userId: string, recipeId: string) => {
  const user = await getUserByIdWithRecipes(userId)
  const recipe = user.recipes.find(r => r.id === recipeId)
  if (!recipe) {
    throw new ApolloError(`recipe with id ${recipeId} not found for userId ${userId}`, 'NOT_FOUND')
  }
  return buildRecipe(user, recipe)
}

const createRecipeMutation = async (userId: string | null | undefined, context: Context, recipe: RecipeUpdate | null | undefined) => {
  userId = userId || (context.user.uid as string)
  if (!recipe) {
    recipe = await generateSampleRecipe(userId)
  }
  validateRecipeRequest(recipe, userId, context)
  const createdRecipe = await createRecipe(userId, recipe)
  return recipeQuery(userId, createdRecipe.id)
}

export const resolvers: Resolvers<Context> = {
  Query: {
    userRecipes: async (obj, { userName }, context) => {
      if (!userName) {
        userName = (await getUserById(context.user.uid)).userName
      }
      const user = await getUserByUserNameWithRecipes(userName)
      return user.recipes.map(r => buildRecipe(user, r))
    },
    recipeByNameAndSlug: async (obj, { userName, recipeSlug }) => {
      const user = await getUserByUserNameWithRecipes(userName)
      const recipe = user.recipes.find(r => r.slug === recipeSlug)
      if (!recipe) {
        throw new ApolloError(`recipe with slug ${recipeSlug} not found for userName ${userName}`, 'NOT_FOUND')
      }
      return buildRecipe(user, recipe)
    },
    recipe: (obj, { userId, recipeId }) => recipeQuery(userId, recipeId),
    user: async (obj, { userId }, context) => {
      try {
        return await getUserById(userId || (context.user.uid as string))
      } catch (e) {
        if (e instanceof Error) {
          throw new ApolloError(e.message, 'USER_NOT_FOUND')
        }
        throw new ApolloError('unknown error', 'USER_NOT_FOUND')
      }
    },
  },
  Mutation: {
    createRecipe: async (obj, { userId, recipe }, context) => {
      return await createRecipeMutation(userId, context, recipe)
    },
    updateRecipe: async (obj, { userId, recipeId, recipe }, context) => {
      userId = userId || (context.user.uid as string)
      validateRecipeRequest(recipe, userId, context)
      await updateRecipe(userId, recipeId, recipe)
      return recipeQuery(userId, recipeId)
    },
    updateUser: async (obj, { userId, user }, context) => {
      const validationResult = userSchema.validate(user)
      if (validationResult.error) {
        throw new ApolloError(validationResult.error.message)
      }
      userId = userId || (context.user.uid as string)
      if (userId !== context.user.uid) {
        throw new AuthenticationError(`User ${context.user.uid} cannot update user ${userId}'s recipe`)
      }
      await updateUser(userId, user)
      return await getUserById(userId)
    },
    remixRecipe: async (obj, { userId, recipeId }, context) => {
      const recipe = await recipeQuery(userId, recipeId)
      const user = await getUserByIdWithRecipes(context.user.uid)
      const slug = findNonClashingSlug(user.recipes, recipe.slug)
      const recipeUpdate = _.pick(recipe, 'markdownTemplate', 'javascriptCode', 'title', 'slug')
      return await createRecipeMutation(context.user.uid, context, { ...recipeUpdate, slug })
    },
    deleteRecipe: async (obj, { userId, recipeId }, context) => {
      userId = userId || (context.user.uid as string)
      if (userId !== context.user.uid) {
        throw new AuthenticationError(`User ${context.user.uid} cannot delete user ${userId}'s recipe`)
      }
      const response = await recipeQuery(userId, recipeId)
      await deleteRecipe(userId, recipeId)
      return response
    },
  },
}
