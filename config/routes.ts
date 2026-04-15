export default [
  { name: '首页', icon: 'HomeOutlined', path: '/knowledge-app', component: './Welcome' },
  { 
    name: '知识库管理',
    icon: 'BookOutlined', 
    path: '/knowledge',
    routes: [
      { path: '/knowledge', redirect: '/knowledge/list' },
      { name: '知识库列表', path: '/knowledge/list', component: './knowledge/list' },
      { name: '文件列表', path: '/knowledge/index', component: './knowledge/index', hideInMenu: true },
      { name: '文件导入', path: '/knowledge/import', component: './knowledge/import', hideInMenu: true },
      { name: '文档详情', path: '/knowledge/document/:id', component: './knowledge/document', hideInMenu: true },
      { name: '文档入库', path: '/knowledge/detail', component: './knowledge' },
      { name: '知识统计', path: '/knowledge/create', component: './table-list' },
    ] 
  },
  { 
    name: '检索服务',
    icon: 'BookOutlined', 
    path: '/search', 
    routes: [
      { name: '向量检索', path: '/search/vector', component: './table-list' },
      { name: '语义检索', path: '/search/semantic', component: './table-list' },
      { name: '检索测试', path: '/search/test', component: './table-list' },
    ] 
  },
  { 
    name: '数据处理',
    icon: 'BookOutlined', 
    path: '/data-handle', 
    routes: [
      { name: '文档解析', path: '/data-handle/parse', component: './table-list' },
      { name: '分片配置', path: '/data-handle/shard', component: './table-list' },
      { name: '向量生成', path: '/data-handle/vector', component: './table-list' },
    ] 
  },
  { 
    name: '知识图谱',
    icon: 'BookOutlined', 
    path: '/knowledge-graph', 
    routes: [
      { name: '图谱构建', path: '/knowledge-graph/build', component: './table-list' },
      { name: '实体抽取', path: '/knowledge-graph/entity', component: './table-list' },
      { name: '关系挖掘', path: '/knowledge-graph/relation', component: './table-list' },
    ] 
  },
  {
    path: '/admin',
    name: '管理页',
    icon: 'CrownOutlined',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '二级管理页', component: './Admin' },
    ],
  },
  { path: '/', redirect: '/knowledge-app' },
  { path: '*', layout: false, component: './404' },
];
