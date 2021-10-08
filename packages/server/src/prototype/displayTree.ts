import fs from 'fs'
import bopen from 'bopen'

export const displayTree = async (taskNode: any) => {
  fs.writeFileSync('./treeWebsite/tree.js', `var tree = ${JSON.stringify(taskNode, null, 2)}`)
  bopen('./treeWebsite/index.html')
}
