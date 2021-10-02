import fs from 'fs'

export const displayTree = async (taskNode: any) => {
  fs.writeFileSync('./treeWebsite/tree.js', `var tree = ${JSON.stringify(taskNode, null, 2)}`)
}
