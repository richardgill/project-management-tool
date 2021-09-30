import React from 'react'
import { Typography } from '@material-ui/core'
import { Link } from '../core/Link'
import Shell from '../Shell'
import { FlexBox } from '../core/Box'

const Feedback = () => {
  return (
    <FlexBox pt={2} flex={null}>
      <FlexBox mt={2} mb={2}>
        <Typography variant="h6">
          {'Send questions or feedback to: '}
          <Link variant="h6" to="mailto:richard@programmablerecipes.com">
            richard@programmablerecipes.com
          </Link>
        </Typography>
      </FlexBox>
    </FlexBox>
  )
}

export default (props: any) => {
  return (
    <Shell>
      <Feedback {...props} />
    </Shell>
  )
}
