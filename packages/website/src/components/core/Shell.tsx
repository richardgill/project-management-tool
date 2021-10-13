import React, { ReactNode } from 'react'
import { Menu } from './Menu'
import { Container } from './Container'

export const Shell = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Menu />
      <Container className="py-6">{children}</Container>
    </>
  )
}
