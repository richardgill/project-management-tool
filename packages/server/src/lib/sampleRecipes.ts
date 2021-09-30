import _ from 'lodash'
import fs from 'fs'
import { getUserByIdWithRecipes } from '../firebase/queries'
import { slugify } from './slugify'
import { RawFBRecipe, FBRecipe } from '../firebase/firebaseTypes'

const startWords = ['Yummy', 'Delicious', 'Tasty']

const recipeTitle = 'Cookie Recipe'
const markdownTemplate = fs.readFileSync('./src/sampleRecipe/markdown.txt').toString()
const javascriptCode = fs.readFileSync('./src/sampleRecipe/javascript.txt').toString()

const titleAndSlugs = () => {
  const suffixes = ['', ..._.range(1000)]
  const titles = suffixes.flatMap(suffix => startWords.map(startWord => `${startWord} ${recipeTitle} ${suffix}`))
  return titles.map(title => ({ title, slug: slugify(title) }))
}

export const generateSampleRecipe = async (userId: string): Promise<RawFBRecipe> => {
  const user = await getUserByIdWithRecipes(userId)
  const slugs = user.recipes.map(r => r.slug)
  const titleAndSlug = _.first(titleAndSlugs().filter(ts => !slugs.includes(ts.slug)))
  if (!titleAndSlug) {
    throw new Error('Ran out of sample recipes')
  }
  return { title: titleAndSlug.title, slug: titleAndSlug.slug, markdownTemplate, javascriptCode }
}

export const findNonClashingSlug = (recipes: FBRecipe[], recipeSlug: string, previousNumber = 0): string => {
  const slugToTry = previousNumber === 0 ? recipeSlug : `${recipeSlug}-${previousNumber}`
  if (!recipes.find(r => r.slug === slugToTry)) {
    return slugToTry
  }
  return findNonClashingSlug(recipes, recipeSlug, previousNumber + 1)
}
