const taskToGanttRow = task => {
  return [
    task.task.title,
    task.task.title,
    task.overrideAssignee.name,
    dayjs(task.startDate).toDate(),
    dayjs(task.endDate).toDate(),
    null,
    task.percentBusy * 100,
    task.overrideAssignee.name,
  ]
}
const resourceToGanttRow = resource => {
  return [resource.name, resource.name, null, null, null, 0, null, null]
}

const taskListsToRows = taskLists => {
  return taskLists.flatMap(({ resource, tasks }) => [resourceToGanttRow(resource), ...tasks.map(t => taskToGanttRow(t))])
}

const drawChart = resourceTaskLists => {
  console.log(resourceTaskLists)

  var data = new google.visualization.DataTable()
  data.addColumn('string', 'Task ID')
  data.addColumn('string', 'Task Name')
  data.addColumn('string', 'Resource')
  data.addColumn('date', 'Start Date')
  data.addColumn('date', 'End Date')
  data.addColumn('number', 'Duration')
  data.addColumn('number', 'Percent Complete')
  data.addColumn('string', 'Dependencies')

  data.addRows(taskListsToRows(resourceTaskLists))

  var options = {
    height: 400,
    gantt: {
      trackHeight: 30,
      arrow: {
        angle: 100,
        width: 0,
        color: 'green',
        radius: 0,
      },
    },
  }
  var container = document.createElement('div')
  var chartTitle = document.createElement('h1')

  chartTitle.innerText = 'Gantt Chart'
  var chartContainer = document.createElement('div')
  container.appendChild(chartTitle)
  container.appendChild(chartContainer)
  document.body.appendChild(container)
  var chart = new google.visualization.Gantt(chartContainer)

  chart.draw(data, options)
}

google.charts.load('current', { packages: ['gantt'] })
google.charts.setOnLoadCallback(() => drawChart(ganttChartData['mid']))
