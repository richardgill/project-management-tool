import { firestore } from 'firebase-admin'
import firebase from './index'
import { RawFBUser, RawFBRecipe, FBUserWithRecipes } from './firebaseTypes'
import { RecipeUpdate, UserUpdate } from '../generated/graphql'

const docToData = <RawType>(userDoc: FirebaseFirestore.DocumentSnapshot<RawType> | FirebaseFirestore.QueryDocumentSnapshot<RawType>) => {
  return { id: userDoc.id, ...(userDoc.data() as RawType) }
}

const getUserDocumentByUserName = async (userName: string) => {
  const result = await firebase
    .firestore()
    .collection('users')
    .where('userName', '==', userName)
    .get()
  if (result.empty) {
    throw new Error(`No user found with userName: ${userName}`)
  }
  return result.docs[0] as FirebaseFirestore.DocumentSnapshot<RawFBUser>
}

export const getUserByUserName = async (userName: string) => {
  return docToData<RawFBUser>(await getUserDocumentByUserName(userName))
}

const userDocumentById = (userId: string) =>
  firebase
    .firestore()
    .collection('users')
    .doc(userId)

const getUserDocumentById = async (userId: string) => {
  const result = await userDocumentById(userId).get()
  return result as FirebaseFirestore.DocumentSnapshot<RawFBUser>
}

const addRecipesToUserdoc = async (userDocument: FirebaseFirestore.DocumentSnapshot<RawFBUser>): Promise<FBUserWithRecipes> => {
  const recipes = (await userDocument.ref.collection('recipes').get()) as firestore.QuerySnapshot<RawFBRecipe>
  const user = docToData<RawFBUser>(userDocument)
  return { ...user, recipes: recipes.docs.map(r => docToData<RawFBRecipe>(r)) }
}

export const getUserByIdWithRecipes = async (userId: string) => {
  return addRecipesToUserdoc(await getUserDocumentById(userId))
}
export const getUserById = async (userId: string) => {
  return docToData<RawFBUser>(await getUserDocumentById(userId))
}

export const getUserByUserNameWithRecipes = async (userName: string) => {
  return addRecipesToUserdoc(await getUserDocumentByUserName(userName))
}

const findRecipeCollection = (userId: string) => {
  return firebase
    .firestore()
    .collection('users')
    .doc(userId)
    .collection('recipes')
}

const findRecipeDoc = (userId: string, recipeId: string) => findRecipeCollection(userId).doc(recipeId)

const checkSlugDoesntExist = async (userId: string, newRecipe: Partial<RecipeUpdate>, recipeId?: string) => {
  if (!newRecipe.slug) {
    return
  }
  const user = await getUserByIdWithRecipes(userId)
  const recipesWithSlug = user.recipes.filter(r => r.slug === newRecipe.slug && r.id !== recipeId)
  if (recipesWithSlug.length > 0) {
    throw new Error(`You already have a recipe with url: ${newRecipe.slug}`)
  }
}

export const updateRecipe = async (userId: string, recipeId: string, recipe: Partial<RecipeUpdate>) => {
  await checkSlugDoesntExist(userId, recipe, recipeId)
  return findRecipeDoc(userId, recipeId).update(recipe)
}
export const deleteRecipe = async (userId: string, recipeId: string) => {
  return findRecipeDoc(userId, recipeId).delete()
}

export const createRecipe = async (userId: string, recipe: RecipeUpdate) => {
  await checkSlugDoesntExist(userId, recipe)
  return findRecipeCollection(userId).add(recipe)
}

export const updateUser = async (userId: string, user: Partial<UserUpdate>) => {
  if (user.userName) {
    const usersWithSameUserName = await firebase
      .firestore()
      .collection('users')
      .where('userName', '==', user.userName)
      .get()

    const clashingUserCount = usersWithSameUserName.docs.filter(u => u.id !== userId).length
    if (clashingUserCount !== 0) {
      throw new Error('Username is a already taken')
    }
  }
  return userDocumentById(userId).set(user, { merge: true })
}
