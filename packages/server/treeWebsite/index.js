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
// ,
// ceo = {
//   text: {
//     name: 'Mark Hill',
//     title: 'Chief executive officer',
//     contact: 'Tel: 01 213 123 134',
//   },
//   HTMLid: 'ceo',
// },
// cto = {
//   parent: ceo,
//   text: {
//     name: 'Joe Linux',
//     title: 'Chief Technology Officer',
//   },
//   HTMLid: 'coo',
// },
// cbo = {
//   parent: ceo,
//   text: {
//     name: 'Linda May',
//     title: 'Chief Business Officer',
//   },
//   HTMLid: 'cbo',
// },
// cdo = {
//   parent: ceo,
//   text: {
//     name: 'John Green',
//     title: 'Chief accounting officer',
//     contact: 'Tel: 01 213 123 134',
//   },
//   HTMLid: 'cdo',
// },
// cio = {
//   parent: cto,
//   text: {
//     name: 'Ron Blomquist',
//     title: 'Chief Information Security Officer',
//   },
//   HTMLid: 'cio',
// },
// ciso = {
//   parent: cto,
//   text: {
//     name: 'Michael Rubin',
//     title: 'Chief Innovation Officer',
//     contact: 'we@aregreat.com',
//   },
//   HTMLid: 'ciso',
// },
// cio2 = {
//   parent: cdo,
//   text: {
//     name: 'Erica Reel',
//     title: 'Chief Customer Officer',
//   },
//   link: {
//     href: 'http://www.google.com',
//     target: '_blank',
//   },
//   HTMLid: 'cio2',
// },
// ciso2 = {
//   parent: cbo,
//   text: {
//     name: 'Alice Lopez',
//     title: 'Chief Communications Officer',
//   },
//   HTMLid: 'ciso2',
// },
// ciso3 = {
//   parent: cbo,
//   text: {
//     name: 'Mary Johnson',
//     title: 'Chief Brand Officer',
//   },
//   HTMLid: 'ciso2',
// },
// ciso4 = {
//   parent: cbo,
//   text: {
//     name: 'Kirk Douglas',
//     title: 'Chief Business Development Officer',
//   },
//   HTMLid: 'ciso2',
// }
// ceo, cto, cbo, cdo, cio, ciso, cio2, ciso2, ciso3, ciso4

console.log(tree)

const nodeToTreant = (node, parent) => {
  return _.omitBy({ text: { name: node.title, ..._.omit(node, 'children', 'title') }, parent }, _.isNil)
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
