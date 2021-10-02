import d3 from 'd3'

import { Task, TaskNode } from './model'

export const printTree = async (taskNode: any) => {
  const hierarchy = d3.hierarchy(taskNode, (node: any) => node.children)
  console.log(hierarchy)
}
