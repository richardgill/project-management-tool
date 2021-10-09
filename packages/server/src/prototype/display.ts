import fs from 'fs'
import { inspect } from 'util'
import bopen from 'bopen'

const getCircularReplacer = function(key: any, value: any) {
  if (key == 'parent') {
    return value.id
  } else {
    return value
  }
}

export const displayTree = async (taskNode: any) => {
  fs.writeFileSync('./treeWebsite/tree.js', `var tree = ${JSON.stringify(taskNode, null, 2)}`)
  bopen('./treeWebsite/index.html')
}

export const displayGanttChart = async (ganttChart: any) => {
  fs.writeFileSync('./ganttWebsite/data.js', `var ganttChartData = ${JSON.stringify(ganttChart, getCircularReplacer, 2)}`)
  bopen('./ganttWebsite/index.html')
}
