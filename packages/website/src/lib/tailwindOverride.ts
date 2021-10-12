import { overrideTailwindClasses } from 'tailwind-override/lib/core'

let tailwindProperties = {}

if (process.env.NODE_ENV === 'production') {
  import('../generated/temp/tailwindProperties.json').then(tailwindPropertiesImport => {
    tailwindProperties = tailwindPropertiesImport
  })
} else {
  import('tailwind-override').then(tailwindOverrideImport => {
    tailwindProperties = tailwindOverrideImport.tailwindProperties
  })
}

export const tailwindOverrideClasses = (classes: string) => {
  if (tailwindProperties === {}) {
    throw new Error('empty tailwind properties was provided')
  }
  return overrideTailwindClasses(classes, { tailwindProperties })
}
