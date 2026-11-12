// Gera elk/kibana-dashboard.ndjson (Data View + 2 gráficos Lens + busca de logs + dashboard).
// Importar no Kibana: Stack Management > Saved Objects > Import (ou via API, ver README).
const fs = require('fs');
const V = '8.13.4';
const dv = 'tarefas-logs';
const ref = (id) => [{ type: 'index-pattern', id: dv, name: `indexpattern-datasource-layer-${id}` }];
const xyCommon = {
  legend: { isVisible: true, position: 'right' },
  valueLabels: 'hide',
  fittingFunction: 'None',
  axisTitlesVisibilitySettings: { x: true, yLeft: true, yRight: true },
  tickLabelsVisibilitySettings: { x: true, yLeft: true, yRight: true },
  labelsOrientation: { x: 0, yLeft: 0, yRight: 0 },
  gridlinesVisibilitySettings: { x: true, yLeft: true, yRight: true },
};
const lens = (id, title, vis, layer, layerId) => ({
  id, type: 'lens', references: ref(layerId), coreMigrationVersion: V, typeMigrationVersion: '8.9.0',
  attributes: {
    title, description: '', visualizationType: 'lnsXY',
    state: {
      visualization: vis,
      query: { query: '', language: 'kuery' }, filters: [],
      datasourceStates: { formBased: { layers: { [layerId]: layer } } },
    },
  },
});

const barStatus = lens('lens-status', 'Requisições por status code', {
  ...xyCommon, preferredSeriesType: 'bar',
  layers: [{ layerId: 'l1', accessors: ['count'], position: 'top', seriesType: 'bar', showGridlines: false, layerType: 'data', xAccessor: 'status' }],
}, {
  columnOrder: ['status', 'count'], incompleteColumns: {},
  columns: {
    status: { label: 'status_code', dataType: 'number', operationType: 'terms', scale: 'ordinal', sourceField: 'status_code', isBucketed: true, params: { size: 10, orderBy: { type: 'column', columnId: 'count' }, orderDirection: 'desc', otherBucket: false, missingBucket: false } },
    count: { label: 'Requisições', dataType: 'number', operationType: 'count', isBucketed: false, scale: 'ratio', sourceField: '___records___', params: { emptyAsNull: true } },
  },
}, 'l1');

const lineTime = lens('lens-tempo', 'Tempo de resposta (ms) – média e p95', {
  ...xyCommon, preferredSeriesType: 'line',
  layers: [{ layerId: 'l2', accessors: ['avg', 'p95'], position: 'top', seriesType: 'line', showGridlines: false, layerType: 'data', xAccessor: 'time' }],
}, {
  columnOrder: ['time', 'avg', 'p95'], incompleteColumns: {},
  columns: {
    time: { label: '@timestamp', dataType: 'date', operationType: 'date_histogram', sourceField: '@timestamp', isBucketed: true, scale: 'interval', params: { interval: 'auto', includeEmptyRows: true, dropPartials: false } },
    avg: { label: 'Média (ms)', dataType: 'number', operationType: 'average', sourceField: 'response_time_ms', isBucketed: false, scale: 'ratio', params: { emptyAsNull: true } },
    p95: { label: 'p95 (ms)', dataType: 'number', operationType: 'percentile', sourceField: 'response_time_ms', isBucketed: false, scale: 'ratio', params: { percentile: 95, emptyAsNull: true } },
  },
}, 'l2');

const search = {
  id: 'search-logs', type: 'search', coreMigrationVersion: V, typeMigrationVersion: '8.0.0',
  attributes: {
    title: 'Logs da aplicação (tempo real)', description: '',
    columns: ['level', 'method', 'path', 'status_code', 'response_time_ms'],
    sort: [['@timestamp', 'desc']], grid: {}, hideChart: true,
    kibanaSavedObjectMeta: { searchSourceJSON: JSON.stringify({ query: { query: '', language: 'kuery' }, filter: [], indexRefName: 'kibanaSavedObjectMeta.searchSourceJSON.index' }) },
  },
  references: [{ name: 'kibanaSavedObjectMeta.searchSourceJSON.index', type: 'index-pattern', id: dv }],
};

const panels = [
  { type: 'search', gridData: { x: 0, y: 0, w: 48, h: 16, i: 'p1' }, panelIndex: 'p1', embeddableConfig: {}, panelRefName: 'panel_p1', version: V },
  { type: 'lens', gridData: { x: 0, y: 16, w: 20, h: 14, i: 'p2' }, panelIndex: 'p2', embeddableConfig: {}, panelRefName: 'panel_p2', version: V },
  { type: 'lens', gridData: { x: 20, y: 16, w: 28, h: 14, i: 'p3' }, panelIndex: 'p3', embeddableConfig: {}, panelRefName: 'panel_p3', version: V },
];
const dashboard = {
  id: 'dash-devops', type: 'dashboard', coreMigrationVersion: V, typeMigrationVersion: '8.9.0',
  attributes: {
    title: 'DevOps – Logs e Métricas da tarefas-api', description: 'Logs em tempo real e métricas de requisições (status code e tempo de resposta)',
    panelsJSON: JSON.stringify(panels), optionsJSON: JSON.stringify({ useMargins: true, syncColors: false, hidePanelTitles: false }),
    timeRestore: true, timeFrom: 'now-30m', timeTo: 'now', refreshInterval: { pause: false, value: 5000 },
    kibanaSavedObjectMeta: { searchSourceJSON: JSON.stringify({ query: { query: '', language: 'kuery' }, filter: [] }) },
  },
  references: [
    { name: 'panel_p1', type: 'search', id: 'search-logs' },
    { name: 'panel_p2', type: 'lens', id: 'lens-status' },
    { name: 'panel_p3', type: 'lens', id: 'lens-tempo' },
  ],
};
const dataView = {
  id: dv, type: 'index-pattern', coreMigrationVersion: V, typeMigrationVersion: '8.0.0',
  attributes: { title: 'tarefas-api-logs-*', name: 'tarefas-api-logs', timeFieldName: '@timestamp' }, references: [],
};

const out = [dataView, barStatus, lineTime, search, dashboard].map((o) => JSON.stringify(o)).join('\n') + '\n';
fs.writeFileSync(__dirname + '/kibana-dashboard.ndjson', out);
console.log('ok');
