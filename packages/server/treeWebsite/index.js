var config = {
  container: '#OrganiseChart1',
  rootOrientation: 'WEST', // NORTH || EAST || WEST || SOUTH
  // levelSeparation: 30,
  siblingSeparation: 20,
  subTeeSeparation: 60,
  scrollbar: 'fancy',
  connectors: {
    type: 'step',
  },
  node: {
    HTMLclass: 'nodeExample1',
  },
}

console.log(tree)

const roundEstimate = estimate => _.round(estimate, 1)
const formatSpread = spread => (spread ? `(min:${roundEstimate(spread.min)}, mid: ${roundEstimate(spread.mid)}, max: ${roundEstimate(spread.max)})` : null)

const nodeToTreant = (node, parent) => {
  const properties = {
    owner: node?.owner?.handle,
    assignee: node?.assignee?.handle,
    status: node?.status,
    estimator: JSON.stringify(node?.estimator, null, 2),
    spread: JSON.stringify(node?.spread, null, 2),
    sumOfEstimatesDays: formatSpread(node?.sumOfEstimates?.DAYS),
    remainingSumOfEstimates: formatSpread(node?.remainingSumOfEstimates?.DAYS),
    assignedEstimatedWorkdays: formatSpread(node?.assignedEstimatedWorkdays),
    unassignedEstimatedWorkdays: formatSpread(node?.unassignedEstimatedWorkdays),
    totalEstimatedWorkdays: formatSpread(node?.totalEstimatedWorkdays),
    remainingAssignedEstimatedWorkdays: formatSpread(node?.remainingAssignedEstimatedWorkdays),
    remainingUnassignedEstimatedWorkdays: formatSpread(node?.remainingUnassignedEstimatedWorkdays),
    remainingTotalEstimatedWorkdays: formatSpread(node?.remainingTotalEstimatedWorkdays),
  }
  const propertiesWithKey = _.chain(properties)
    .omitBy(_.isNil)
    .mapValues((v, k) => `${k}: ${v}`)
    .value()
  return _.omitBy({ text: { name: node.title, ...propertiesWithKey }, parent }, _.isNil)
}

const flattenTree = (node, parent = null) => {
  if (!node) {
    return []
  }
  const children = node.children || []
  const nodeToAddToTree = nodeToTreant(node, parent)
  return [nodeToAddToTree, ..._.flattenDeep(children.map(c => flattenTree(c, nodeToAddToTree)))]
}

const flattenedTree = flattenTree(tree)

console.log(flattenedTree)
new Treant([config, ...flattenedTree])
