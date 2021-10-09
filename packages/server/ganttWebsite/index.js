// ;[
//   ['2014Spring', 'Spring 2014', 'spring', new Date(2014, 2, 22), new Date(2014, 5, 20), null, 100, null],
//   ['2014Summer', 'Summer 2014', 'summer', new Date(2014, 5, 21), new Date(2014, 8, 20), null, 100, null],
//   ['2014Autumn', 'Autumn 2014', 'autumn', new Date(2014, 8, 21), new Date(2014, 11, 20), null, 100, null],
//   ['2014Winter', 'Winter 2014', 'winter', new Date(2014, 11, 21), new Date(2015, 2, 21), null, 100, null],
//   ['2015Spring', 'Spring 2015', 'spring', new Date(2015, 2, 22), new Date(2015, 5, 20), null, 50, null],
//   ['2015Summer', 'Summer 2015', 'summer', new Date(2015, 5, 21), new Date(2015, 8, 20), null, 0, null],
//   ['2015Autumn', 'Autumn 2015', 'autumn', new Date(2015, 8, 21), new Date(2015, 11, 20), null, 0, null],
//   ['2015Winter', 'Winter 2015', 'winter', new Date(2015, 11, 21), new Date(2016, 2, 21), null, 0, null],
//   ['Football', 'Football Season', 'sports', new Date(2014, 8, 4), new Date(2015, 1, 1), null, 100, null],
//   ['Baseball', 'Baseball Season', 'sports', new Date(2015, 2, 31), new Date(2015, 9, 20), null, 14, null],
//   ['Basketball', 'Basketball Season', 'sports', new Date(2014, 9, 28), new Date(2015, 5, 20), null, 86, null],
//   ['Hockey', 'Hockey Season', 'sports', new Date(2014, 9, 8), new Date(2015, 5, 21), null, 89, null],
// ]

const taskToGantRow = (resource, task) => {
  return [task.task.title, task.task.title, resource.name, dayjs(task.startDate).toDate(), dayjs(task.endDate).toDate(), null, 100, null]
}

const drawChart = resourceTaskList => {
  console.log(resourceTaskList)

  var data = new google.visualization.DataTable()
  data.addColumn('string', 'Task ID')
  data.addColumn('string', 'Task Name')
  data.addColumn('string', 'Resource')
  data.addColumn('date', 'Start Date')
  data.addColumn('date', 'End Date')
  data.addColumn('number', 'Duration')
  data.addColumn('number', 'Percent Complete')
  data.addColumn('string', 'Dependencies')

  data.addRows(resourceTaskList.tasks.map(t => taskToGantRow(resourceTaskList.resource, t)))

  var options = {
    // height: 400,
    gantt: {
      trackHeight: 30,
    },
  }
  var container = document.createElement('div')
  var chartTitle = document.createElement('h1')

  chartTitle.innerText = resourceTaskList.resource.name
  var chartContainer = document.createElement('div')
  container.appendChild(chartTitle)
  container.appendChild(chartContainer)
  document.body.appendChild(container)
  var chart = new google.visualization.Gantt(chartContainer)

  chart.draw(data, options)
}

const drawCharts = () => {
  for (resourceTaskList of ganttChartData['mid']) {
    drawChart(resourceTaskList)
  }
}

google.charts.load('current', { packages: ['gantt'] })
google.charts.setOnLoadCallback(drawCharts)
