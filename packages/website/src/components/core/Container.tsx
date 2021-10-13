import React, { ReactNode } from 'react'
import { classNames } from 'lib/classNames'

export const Container = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={classNames('max-w-7xl mx-auto px-2 sm:px-6 lg:px-8', className)}>{children}</div>
)

Container.defaultProps = {
  className: '',
}
