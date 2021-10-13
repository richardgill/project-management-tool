import { tailwindOverrideClasses } from './tailwindOverride'

export const classNames = (...classes: any[]): string => {
  return classes.filter(Boolean).join(' ')
}

export const classNamesOverride = (...classes: any[]) => {
  return tailwindOverrideClasses(classNames(classes))
}
