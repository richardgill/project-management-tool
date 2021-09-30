import Joi from '@hapi/joi'

export const recipeSchema = Joi.object({
  title: Joi.string(),
  slug: Joi.string().pattern(/^([a-z0-9]|-)+$/),
  markdownTemplate: Joi.string(),
  javascriptCode: Joi.string(),
})

export const userSchema = Joi.object({
  userName: Joi.string().pattern(/^([a-z0-9])+$/),
})
