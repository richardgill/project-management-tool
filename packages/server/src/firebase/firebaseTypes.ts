export interface FBUserWithRecipes extends FBUser {
  recipes: FBRecipe[]
}

export interface FBUser extends RawFBUser, FBDocument {}

export interface RawFBUser {
  userName: string
}

export interface FBRecipe extends RawFBRecipe, FBDocument {}

interface FBDocument {
  id: string
}

export interface RawFBRecipe {
  title: string
  slug: string
  markdownTemplate: string
  javascriptCode: string
}
