import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { History } from 'history'
import { Card, SvgIconTypeMap, Typography } from '@material-ui/core'
import ImportExportIcon from '@material-ui/icons/ImportExport'
import styled from 'styled-components'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import TimerIcon from '@material-ui/icons/Timer'
import LoopIcon from '@material-ui/icons/Loop'
import CodeIcon from '@material-ui/icons/Code'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Link } from '../core/Link'
import { FindRecipeByNameAndSlugQuery, FindRecipeByNameAndSlugQueryVariables } from '../../generated/graphql'
import { RECIPE_BY_USERNAME_AND_SLUG_QUERY } from '../../lib/graphqlQueries'
import Shell from '../Shell'
import QueryLoader from '../core/QueryLoader'
import { FlexBox } from '../core/Box'
import { EmbeddedRecipe } from '../Recipe/EmbeddedRecipe'
import { RemixButton } from '../Recipe/RemixButton'

const LoadEmbeddedRecipe = ({ userName, recipeSlug, history }: { userName: string; recipeSlug: string; history: History }) => {
  const queryResult = useQuery<FindRecipeByNameAndSlugQuery, FindRecipeByNameAndSlugQueryVariables>(RECIPE_BY_USERNAME_AND_SLUG_QUERY, {
    variables: { userName, recipeSlug }
  })

  return (
    <QueryLoader queryResult={queryResult}>
      {data => (
        <EmbeddedRecipe
          recipe={data.recipeByNameAndSlug}
          topSection={<RemixButton recipe={data.recipeByNameAndSlug} history={history} />}
        />
      )}
    </QueryLoader>
  )
}

const BulletText = styled(Typography)`
  margin-left: 10px;
`

const Bullet = ({ icon, text }: { icon: OverridableComponent<SvgIconTypeMap>; text: string }) => {
  const Icon = icon
  return (
    <FlexBox flexDirection="row" alignItems="center" mt={1} mb={2}>
      <Icon fontSize="large" />
      <BulletText variant="h6">{text}</BulletText>
    </FlexBox>
  )
}

export default (props: any) => {
  return (
    <Shell>
      <FlexBox pt={2} flex={1}>
        <Typography variant="h3" gutterBottom>
          Write powerful recipes backed by code
        </Typography>
        <FlexBox mb={3}>
          <Bullet icon={ImportExportIcon} text="Scale recipe quantities" />
          <Bullet icon={ExpandMoreIcon} text="Expandable Sections" />
          <Bullet icon={TimerIcon} text="Timers" />
          <Bullet icon={LoopIcon} text={`'Remix' other people's recipes`} />
          <Bullet icon={CodeIcon} text={`Use Markdown, Javascript and Handlebars to write recipes`} />
        </FlexBox>
        <Typography variant="h6" gutterBottom>
          {'Checkout the '}
          <Link to="/recipes/examples/examples">Examples</Link>
          {' or '}
          <Link to="/recipes/richardgill">my own recipes</Link>
        </Typography>
        <FlexBox mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            {`Here's a sample recipe:`}
          </Typography>
        </FlexBox>
        <FlexBox mt={2} mb={2}>
          <Card>
            <LoadEmbeddedRecipe userName="examples" recipeSlug="how-it-works" history={props.history} />
          </Card>
        </FlexBox>
        <FlexBox mt={2} mb={2}>
          <Typography variant="subtitle1">
            {'Questions or Feedback? Email me: '}
            <Link variant="subtitle1" to="mailto:richard@programmablerecipes.com">
              richard@programmablerecipes.com
            </Link>
          </Typography>
        </FlexBox>
      </FlexBox>
    </Shell>
  )
}
