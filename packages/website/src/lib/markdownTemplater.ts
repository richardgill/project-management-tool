import Handlebars from 'handlebars'

const parseComponents = (handlebarsOutput: string) => {
  return handlebarsOutput.split(/@£@(.*)£@£/).map(templatedString => {
    if (templatedString.startsWith('{')) {
      return JSON.parse(templatedString)
    }
    return { component: 'markdown', props: { source: templatedString } }
  })
}

const inlineComponent = (component: string, props: object) => {
  return new Handlebars.SafeString(
    `<span data-react-component="${btoa(
      JSON.stringify({
        component,
        props
      })
    )}" />`
  )
}

Handlebars.registerHelper('infoToolTip', text => {
  return inlineComponent('infoToolTip', { text })
})

Handlebars.registerHelper('slider', params => {
  const defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    value: 100
  }
  const props = { ...defaultProps, ...params.hash }

  return new Handlebars.SafeString(`@£@${JSON.stringify({ component: 'slider', props })}£@£`)
})

Handlebars.registerHelper('timer', params => {
  const defaultProps = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    text: 'timer'
  }
  const props = { ...defaultProps, ...params.hash }

  return inlineComponent('timer', props)
})

/* eslint-disable-next-line func-names */
Handlebars.registerHelper('expander', function(this: any, params) {
  const props = params.hash
  const contentMarkdown = params.fn(this)
  return new Handlebars.SafeString(
    `@£@${JSON.stringify({ component: 'expander', props: { startOpen: props.startOpen, titleMarkdown: props.title, contentMarkdown } })}£@£`
  )
})

export const markdownToComponents = (markdownTemplate: string, handlebarData: any) => {
  const template = Handlebars.compile(markdownTemplate)
  return parseComponents(template(handlebarData))
}
