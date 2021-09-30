import _ from 'lodash'
import React, { useRef, useState, useContext } from 'react'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Typography, TextField, Tabs, Tab } from '@material-ui/core'
import LaunchIcon from '@material-ui/icons/Launch'
import EditIcon from '@material-ui/icons/Edit'
import CodeIcon from '@material-ui/icons/Code'
import DescriptionIcon from '@material-ui/icons/Description'
import styled from 'styled-components'
import {
  FindRecipeByIdQuery,
  FindRecipeByIdQueryVariables,
  UpdateRecipeMutationVariables,
  UpdateRecipeMutation,
  RecipeUpdate
} from '../../generated/graphql'
import { UPDATE_RECIPE, RECIPE_BY_ID_QUERY, RECIPES_BY_USERNAME } from '../../lib/graphqlQueries'
import { slugify, slugifyIntermediate } from '../../lib/slugify'
import QueryLoader from '../core/QueryLoader'
import Shell, { DefaultShellContainerComponent } from '../Shell'
import { FlexBox } from '../core/Box'
import EditorComponent from '../core/Editor'
import { EmbeddedRecipe } from '../Recipe/EmbeddedRecipe'
import SplitPane from '../core/SplitPane'
import { UserContext } from '../Context'
import { ButtonLink } from '../core/Link'

const FIRST_PANE_MIN_SIZE = 500

const Editor = styled(EditorComponent)`
  width: auto;
  display: flex;
  flex: 1;
`

const SplitPaneContainer = styled(FlexBox)`
  position: relative;
`

const markdownTab = <Tab label="Markdown" icon={<EditIcon fontSize="small" />} />
const javascriptTab = <Tab label="Code" icon={<CodeIcon fontSize="small" />} />

const FullScreenContainer = ({ children }: { children: React.ReactNode }) => (
  <FlexBox flex={1} style={{ height: '100vh' }}>
    {children}
  </FlexBox>
)

export default (props: any) => {
  const { userId, recipeId }: { userId: string; recipeId: string } = props.match.params
  const queryResult = useQuery<FindRecipeByIdQuery, FindRecipeByIdQueryVariables>(RECIPE_BY_ID_QUERY, {
    variables: { userId, recipeId }
  })
  const user = useContext(UserContext)
  const [updateRecipeMutation, updateRecipeResult] = useMutation<UpdateRecipeMutation, UpdateRecipeMutationVariables>(UPDATE_RECIPE, {
    refetchQueries: [{ query: RECIPES_BY_USERNAME }]
  })
  const updateRecipeDebounce = useRef(_.debounce(updateRecipeMutation, 1000)).current

  const [editingRecipe, setEditingRecipe] = useState({})
  const [leftTabIndex, setLeftTabIndex] = useState(0)
  const [rightTabIndex, setRightTabIndex] = useState(0)
  const updateRecipe = async (recipe: RecipeUpdate) => {
    setEditingRecipe({ ...editingRecipe, ...recipe })
    try {
      await updateRecipeDebounce({ variables: { userId, recipeId, recipe } })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Shell shellContainerComponent={FullScreenContainer}>
      <QueryLoader queryResult={queryResult}>
        {data => {
          const recipe = { ...data.recipe, ...editingRecipe }
          const markdownEditor = (
            <Editor
              mode="markdown"
              theme="github"
              width="auto"
              onChange={newMarkdownTemplate => updateRecipe({ markdownTemplate: newMarkdownTemplate })}
              name="markdown_template"
              value={recipe.markdownTemplate}
            />
          )
          const javascriptEditor = (
            <Editor
              mode="javascript"
              theme="github"
              width="auto"
              onChange={newJavascriptCode => updateRecipe({ javascriptCode: newJavascriptCode })}
              name="javascript_code"
              value={recipe.javascriptCode}
            />
          )
          return (
            <FlexBox flex={1}>
              <DefaultShellContainerComponent flex={0}>
                <FlexBox alignItems="center" flexDirection="row" mt={1}>
                  <TextField
                    label="Title"
                    value={recipe.title}
                    onChange={e => {
                      const newTitle = e.target.value
                      const oldSlug = slugify(recipe.title)
                      let slugUpdate = {}
                      if (recipe.slug === oldSlug) {
                        slugUpdate = { slug: slugify(newTitle) }
                      }
                      updateRecipe({ title: newTitle, ...slugUpdate })
                    }}
                  />
                  <FlexBox ml={2} mr={2}>
                    <TextField
                      label="Recipe url"
                      value={recipe.slug}
                      onChange={e => updateRecipe({ slug: slugifyIntermediate(e.target.value) })}
                    />
                  </FlexBox>
                  {user?.isAnonymous ? (
                    <ButtonLink variant="contained" color="primary" to="/signUp">
                      Save
                    </ButtonLink>
                  ) : (
                    <>
                      <ButtonLink
                        to={`/recipes/${recipe.userName}/${recipe.slug}`}
                        target="_blank"
                        color="primary"
                        endIcon={<LaunchIcon fontSize="small" />}
                      >
                        Open Recipe
                      </ButtonLink>
                      <ButtonLink to="/how-it-works" target="_blank" endIcon={<HelpOutlineIcon fontSize="small" />}>
                        Learn to write recipes
                      </ButtonLink>
                    </>
                  )}
                  <Typography variant="body1" color="error">
                    {updateRecipeResult.error?.graphQLErrors[0]?.message}
                  </Typography>
                </FlexBox>
              </DefaultShellContainerComponent>
              <SplitPaneContainer flex={1} mt={2}>
                <SplitPane
                  split="vertical"
                  style={{ top: 0, bottom: 0, height: 'auto' }}
                  paneStyle={{ display: 'flex' }}
                  primary="second"
                  defaultSize={Math.max(window.innerWidth / 2.5, FIRST_PANE_MIN_SIZE)}
                  minSize={FIRST_PANE_MIN_SIZE}
                >
                  <FlexBox flex={1}>
                    <Tabs value={leftTabIndex} onChange={(event, tabIndex) => setLeftTabIndex(tabIndex)}>
                      {markdownTab}
                      {javascriptTab}
                    </Tabs>
                    {leftTabIndex === 0 && markdownEditor}
                    {leftTabIndex === 1 && javascriptEditor}
                  </FlexBox>
                  <FlexBox flex={1}>
                    <Tabs value={rightTabIndex} onChange={(event, tabIndex) => setRightTabIndex(tabIndex)}>
                      <Tab label="Recipe" icon={<DescriptionIcon fontSize="small" />} />
                      {javascriptTab}
                      {markdownTab}
                    </Tabs>
                    {rightTabIndex === 0 && <EmbeddedRecipe scrolls recipe={recipe} />}
                    {rightTabIndex === 1 && javascriptEditor}
                    {rightTabIndex === 2 && markdownEditor}
                  </FlexBox>
                </SplitPane>
              </SplitPaneContainer>
            </FlexBox>
          )
        }}
      </QueryLoader>
    </Shell>
  )
}
