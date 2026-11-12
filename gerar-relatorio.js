// Gera Relatorio_DevOps.docx em formato ABNT (NBR 14724 / 6023 / 10520).
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, LevelFormat, AlignmentType,
  ImageRun, TableOfContents, Header, PageNumber, TableBorders, BorderStyle, SectionType, TabStopType,
} = require('docx');

const FONT = 'Arial';
const AUTORES = ['Alan dos Anjos Leão', 'Lucas Soares Vilhena'];
const TITULO = 'DevOps na prática: pipeline CI/CD, Kubernetes com Helm e monitoramento com Elastic Stack';
const INSTITUICAO = '[NOME DA INSTITUIÇÃO]';
const CIDADE = '[CIDADE]';
const ANO = '2026';
const REPO = 'https://github.com/leao-leao/devops-atividade-final';

// ---------- helpers ----------
const run = (t, o = {}) => new TextRun({ text: t, font: FONT, size: 24, ...o });
const P = (t) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: 360, after: 0 }, indent: { firstLine: 709 }, children: [run(t)] });
const Pm = (parts) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: 360, after: 0 }, indent: { firstLine: 709 }, children: parts }); // parágrafo com trechos formatados
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t.toUpperCase(), { bold: true })] });
const H1c = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [run(t.toUpperCase(), { bold: true })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(t, { bold: true })] });
let listaN = 0;
const ALINEA = (t, last, inst) => new Paragraph({ numbering: { reference: 'alinea', level: 0, instance: inst }, alignment: AlignmentType.JUSTIFIED, spacing: { line: 360, after: 0 }, children: [run(t.replace(/[;.]$/, '') + (last ? '.' : ';'))] });
const alineas = (arr) => { listaN += 1; return arr.map((t, i) => ALINEA(t, i === arr.length - 1, listaN)); };
const CODE = (t) => new Paragraph({ spacing: { line: 240, after: 0 }, indent: { left: 709 }, children: [new TextRun({ text: t, font: 'Consolas', size: 20 })] });
const CODEEND = () => new Paragraph({ spacing: { line: 360 }, children: [] });
const SMALL = (t, align = AlignmentType.CENTER) => new Paragraph({ alignment: align, spacing: { line: 240, before: 60, after: 60 }, children: [run(t, { size: 20 })] });
const FONTE = (t = 'Fonte: Elaborado pelos autores (2026).') => SMALL(t);
const BLANK = () => new Paragraph({ spacing: { line: 360 }, children: [] });

// Tabelas ABNT: título acima, sem bordas laterais, fonte abaixo.
const hline = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const tcell = (t, w, head, last) => new TableCell({
  width: { size: w, type: WidthType.DXA },
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  borders: { top: head ? hline : none, bottom: head || last ? hline : none, left: none, right: none },
  children: [new Paragraph({ spacing: { line: 240 }, children: [run(t, { size: 20, bold: head })] })],
});
let nTab = 0;
const tabela = (titulo, rows, widths, fonte) => {
  nTab += 1;
  return [
    SMALL(`Tabela ${nTab} – ${titulo}`),
    new Table({
      width: { size: widths.reduce((a, b) => a + b), type: WidthType.DXA }, columnWidths: widths,
      borders: TableBorders.NONE,
      rows: rows.map((r, i) => new TableRow({ cantSplit: true, children: r.map((c, j) => tcell(c, widths[j], i === 0, i === rows.length - 1)) })),
    }),
    FONTE(fonte),
    BLANK(),
  ];
};

// Figuras ABNT: título acima, imagem, fonte abaixo.
let nFig = 0;
const figCell = (file, titulo, w, h, wCell) => {
  nFig += 1;
  const type = file.endsWith('.png') ? 'png' : 'jpg';
  return new TableCell({
    width: { size: wCell, type: WidthType.DXA },
    borders: { top: none, bottom: none, left: none, right: none },
    children: [
      SMALL(`Figura ${nFig} – ${titulo}`),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type, data: fs.readFileSync('docs/prints/' + file), transformation: { width: w, height: h } })] }),
      FONTE(),
    ],
  });
};
const figs = (list, w, h) => new Table({
  width: { size: 9070, type: WidthType.DXA }, columnWidths: list.map(() => Math.floor(9070 / list.length)), borders: TableBorders.NONE,
  rows: [new TableRow({ cantSplit: true, children: list.map(([f, t]) => figCell(f, t, w, h, Math.floor(9070 / list.length))) })],
});

// ---------- capa, folha de rosto, sumário ----------
const center = (t, o = {}, sp = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 360, ...sp }, children: [run(t, o)] });
const capa = [
  center(INSTITUICAO, { bold: true }),
  center('Curso: [NOME DO CURSO]'),
  ...AUTORES.map((a, i) => center(a.toUpperCase(), { bold: true }, { before: i === 0 ? 2400 : 0 })),
  center(TITULO.toUpperCase(), { bold: true }, { before: 3200 }),
  center(CIDADE, {}, { before: 4200 }),
  center(ANO),
  new Paragraph({ pageBreakBefore: true, children: [] }),
];
const rosto = [
  ...AUTORES.map((a, i) => center(a.toUpperCase(), { bold: true }, { before: i === 0 ? 0 : 0 })),
  center(TITULO.toUpperCase(), { bold: true }, { before: 3000 }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED, indent: { left: 4536 }, spacing: { line: 240, before: 2400, after: 480 },
    children: [run('Relatório da Atividade Final apresentado à disciplina DevOps Tools, do curso de [NOME DO CURSO], da ' + INSTITUICAO + ', como requisito de avaliação.', { size: 20 })],
  }),
  new Paragraph({ indent: { left: 4536 }, spacing: { line: 240 }, children: [run('Professor: Rodrigo Marques', { size: 20 })] }),
  center(CIDADE, {}, { before: 3400 }),
  center(ANO),
  new Paragraph({ pageBreakBefore: true, children: [] }),
];
const sumario = [
  center('SUMÁRIO', { bold: true }, { after: 240 }),
  new TableOfContents('Sumário', { hyperlink: true, headingStyleRange: '1-2' }),
];

// ---------- corpo ----------
const b = [];
b.push(H1('1 Introdução'));
b.push(P('A entrega de software em ciclos curtos e com qualidade exige que desenvolvimento e operações trabalhem de forma integrada e automatizada. Essa integração é o núcleo da cultura DevOps, que combina práticas de integração e entrega contínuas, infraestrutura padronizada por containers e monitoramento constante da aplicação em produção (KIM et al., 2018; HUMBLE; FARLEY, 2014).'));
b.push(P('Este relatório documenta o projeto prático desenvolvido para a Atividade Final da disciplina DevOps Tools. O projeto abrange cinco etapas: (i) os conceitos fundamentais de DevOps; (ii) um pipeline de integração e entrega contínuas com GitHub Actions; (iii) a implantação contínua em um cluster Kubernetes por meio de Helm; (iv) a coleta de logs e métricas com Filebeat, Elasticsearch e Kibana; e (v) este relatório consolidado, com a reflexão crítica sobre o valor do DevOps.'));
b.push(Pm([run('Todo o código-fonte, o pipeline, o chart Helm e a configuração de monitoramento estão disponíveis no repositório público '), run(REPO, { underline: {} }), run('.')]));

b.push(H1('2 Fundamentação teórica'));
b.push(H2('2.1 DevOps e sua relação com as metodologias ágeis'));
b.push(P('DevOps é uma cultura e um conjunto de práticas que integra as equipes de desenvolvimento (Dev) e de operações (Ops) para entregar software com mais rapidez, frequência e confiabilidade. Em vez de times isolados, que repassam o código de uma etapa à outra, desenvolvedores e operadores compartilham a responsabilidade pelo produto durante todo o seu ciclo de vida, apoiados por automação, infraestrutura como código, monitoramento e feedback contínuo (KIM et al., 2018).'));
b.push(P('As metodologias ágeis, como Scrum, Kanban e Extreme Programming, valorizam ciclos curtos de desenvolvimento, colaboração e resposta rápida a mudanças (BECK et al., 2001). Entretanto, de nada adianta a equipe produzir uma funcionalidade a cada iteração se ela leva semanas para chegar à produção. O DevOps estende a mentalidade ágil até a entrega e a operação: o ágil acelera o desenvolvimento, e o DevOps acelera e estabiliza a entrega. Por analogia, o ágil é uma cozinha que prepara pratos em pequenas porções com rapidez, enquanto o DevOps é o processo que leva cada prato quente até a mesa, de forma padronizada e com avaliação constante dos clientes.'));
b.push(H2('2.2 Integração contínua, entrega contínua e implantação contínua'));
b.push(P('A integração contínua (CI) consiste em integrar o código de todos os desenvolvedores várias vezes ao dia, compilando-o e testando-o automaticamente a cada alteração, para detectar erros o mais cedo possível. A entrega contínua (Continuous Delivery) amplia a CI: toda alteração aprovada nos testes gera um artefato pronto para ir à produção a qualquer momento, mas a publicação depende de uma aprovação humana. Na implantação contínua (Continuous Deployment), por fim, a publicação em produção também é automática (HUMBLE; FARLEY, 2014). A Tabela 1 resume as diferenças.'));
b.push(BLANK());
b.push(...tabela('Diferenças entre CI, Continuous Delivery e Continuous Deployment', [
  ['Prática', 'O que faz', 'Aprovação para produção'],
  ['Integração contínua (CI)', 'A cada alteração, o código é integrado, compilado e testado automaticamente.', 'Não chega à produção; apenas valida o código.'],
  ['Continuous Delivery', 'Todo código aprovado gera um artefato pronto para implantação a qualquer momento.', 'Manual: uma pessoa aprova a publicação.'],
  ['Continuous Deployment', 'Toda alteração aprovada nos testes é publicada em produção.', 'Automática: ninguém precisa aprovar.'],
], [2300, 4170, 2600], 'Fonte: Adaptado de Humble e Farley (2014).'));
b.push(P('No projeto, o job de CI do GitHub Actions executa os testes, constrói a imagem e a publica no registry (CI e artefato pronto para entrega), enquanto o job de deploy implanta a aplicação no Kubernetes automaticamente a cada alteração na ramificação principal, caracterizando a implantação contínua.'));
b.push(H2('2.3 Máquinas virtuais e containers'));
b.push(P('Uma máquina virtual (VM) emula um computador completo, com sistema operacional próprio, sobre um hipervisor. Já os containers isolam apenas processos e compartilham o núcleo (kernel) do sistema operacional hospedeiro, o que os torna mais leves e rápidos (DOCKER, 2026). A Tabela 2 compara as duas tecnologias.'));
b.push(BLANK());
b.push(...tabela('Comparação entre máquinas virtuais e containers', [
  ['Aspecto', 'Máquina virtual', 'Container'],
  ['Isolamento', 'Sistema operacional completo por VM, sobre hipervisor.', 'Processos isolados que compartilham o kernel do hospedeiro.'],
  ['Tamanho', 'Gigabytes.', 'Megabytes (por exemplo, a imagem node:20-alpine).'],
  ['Inicialização', 'Minutos.', 'Segundos ou menos.'],
  ['Consumo de recursos', 'Alto, pois cada VM carrega um sistema operacional.', 'Baixo; comporta muito mais instâncias por servidor.'],
  ['Portabilidade', 'Imagens pesadas e dependentes do hipervisor.', 'O mesmo artefato executa em qualquer ambiente com runtime de containers.'],
], [2000, 3535, 3535], 'Fonte: Adaptado de Docker (2026).'));
b.push(P('As principais vantagens dos containers são ambientes idênticos do desenvolvimento à produção, builds reproduzíveis, implantações rápidas, escalonamento horizontal simples e melhor aproveitamento do hardware. Por analogia, uma VM é uma casa inteira, com fundação, encanamento e energia próprios; os containers são apartamentos de um mesmo prédio, que compartilham a estrutura (o kernel), mas mantêm cada unidade isolada.'));

b.push(H1('3 Metodologia e ferramentas'));
b.push(P('O projeto foi desenvolvido em um repositório Git hospedado no GitHub. A Tabela 3 relaciona cada etapa da atividade às ferramentas utilizadas e aos artefatos produzidos.'));
b.push(BLANK());
b.push(...tabela('Etapas, ferramentas e artefatos do projeto', [
  ['Etapa', 'Ferramentas', 'Artefatos no repositório'],
  ['2 – CI/CD', 'Node.js, Docker, GitHub Actions, GitHub Container Registry', 'app/, .github/workflows/main.yml'],
  ['3 – Orquestração', 'Kubernetes (Kind), Helm', 'helm/tarefas-api/'],
  ['4 – Logs e métricas', 'Filebeat, Elasticsearch, Kibana, Docker Compose', 'elk/'],
], [1900, 4170, 3000], 'Fonte: Elaborado pelos autores (2026).'));

b.push(H1('4 Desenvolvimento'));
b.push(H2('4.1 Aplicação'));
b.push(P('Foi desenvolvida uma API REST de tarefas em Node.js com o framework Express (diretório app/). Ela expõe os endpoints /health, /api/tarefas (GET, POST e DELETE), /api/lento e /api/erro; os dois últimos geram latência variável e erros HTTP 500, a fim de produzir dados relevantes para o monitoramento. A cada requisição, a aplicação escreve na saída padrão um log estruturado em JSON contendo método, caminho, status_code e response_time_ms. Cinco testes automatizados, escritos com o módulo nativo node:test, validam o funcionamento dos endpoints e do log.'));
b.push(H2('4.2 Integração e entrega contínuas (Etapa 2)'));
b.push(P('O pipeline está definido em .github/workflows/main.yml e é acionado a cada push ou pull request na ramificação principal (GITHUB, 2026). O job ci executa, em sequência:'));
b.push(...alineas([
  'instalação das dependências e execução dos testes automatizados (npm test);',
  'construção da imagem Docker, a partir do Dockerfile baseado em node:20-alpine, com execução por usuário não administrador e verificação de saúde (HEALTHCHECK);',
  'publicação da imagem no GitHub Container Registry (ghcr.io), com as etiquetas do hash do commit e latest, apenas em pushes na ramificação principal',
]));
b.push(P('A Figura 1 mostra a execução completa do pipeline, com os jobs ci e deploy concluídos com sucesso em 2 minutos e 5 segundos; a Figura 2 mostra os cinco testes aprovados; e a Figura 3 mostra a imagem publicada no registry.'));
b.push(BLANK());
b.push(figs([['01-pipeline-sucesso.jpg', 'Pipeline CI-CD executado com sucesso'], ['02-ci-testes.jpg', 'Job ci: cinco testes aprovados']], 190, 360));
b.push(BLANK());
b.push(figs([['05-imagem-ghcr.jpg', 'Imagem publicada no ghcr.io']], 190, 360));
b.push(BLANK());
b.push(H2('4.3 Implantação contínua e orquestração (Etapa 3)'));
b.push(P('O diretório helm/tarefas-api contém o chart Helm (HELM, 2026) com os modelos de Deployment, Service e Ingress opcional. O Deployment executa duas réplicas com sondas de prontidão e de vivacidade em /health e limites de recursos; o Service é do tipo NodePort, na porta 30080 (KUBERNETES, 2026).'));
b.push(P('O job deploy do pipeline é executado após o CI: cria um cluster Kubernetes efêmero com Kind no próprio runner, registra um segredo para obter a imagem do registry e executa o comando helm upgrade --install, com a etiqueta da imagem igual ao hash do commit, de modo que cada alteração publica automaticamente uma nova versão. Em seguida, o job lista os recursos e testa o serviço pela porta NodePort. Para uso local, o mesmo chart pode ser instalado em um cluster Minikube ou Kind:'));
b.push(CODE('kind create cluster'));
b.push(CODE('helm upgrade --install tarefas-api ./helm/tarefas-api \\'));
b.push(CODE('  --set image.repository=ghcr.io/leao-leao/devops-atividade-final'));
b.push(CODE('kubectl get pods,svc'));
b.push(CODEEND());
b.push(P('A Figura 4 registra a instalação do chart (status deployed) e a Figura 5 mostra os dois pods em execução (Running), o serviço NodePort 80:30080 e a resposta {"status":"ok"} do endpoint de saúde.'));
b.push(BLANK());
b.push(figs([['03-deploy-helm.jpg', 'Instalação do chart com Helm'], ['04-kubernetes-pods-svc.jpg', 'Pods e serviço no Kubernetes']], 190, 360));
b.push(BLANK());
b.push(H2('4.4 Logging e métricas (Etapa 4)'));
b.push(P('A pasta elk/ contém um arquivo Docker Compose que sobe a aplicação, o Elasticsearch, o Kibana e o Filebeat, todos na versão 8.13.4 (ELASTIC, 2026). O processo de coleta dos dados pelo Filebeat ocorre da seguinte forma:'));
b.push(...alineas([
  'a aplicação escreve cada log em JSON na saída padrão, e o Docker, configurado com o driver json-file, grava essas linhas em /var/lib/docker/containers/<id>/<id>-json.log;',
  'o Filebeat monta esse diretório em modo somente leitura e utiliza o input container para ler os arquivos; o processador add_docker_metadata identifica o container de origem e o processador drop_event descarta os registros dos demais containers (Elasticsearch, Kibana etc.);',
  'o processador decode_json_fields converte o campo message, que contém o JSON em texto, em campos individuais (status_code, response_time_ms, method, path e level), que passam a ser numéricos e agregáveis;',
  'o Filebeat envia os eventos ao Elasticsearch, no índice tarefas-api-logs-AAAA.MM.DD, que o Kibana consulta por meio de um Data View de padrão tarefas-api-logs-*',
]));
b.push(P('No Kibana, foi criado um dashboard com três painéis: os logs da aplicação em tempo real (atualização a cada cinco segundos), a quantidade de requisições por status_code e o tempo de resposta ao longo do tempo (média e percentil 95). Os objetos do dashboard foram exportados para o arquivo elk/kibana-dashboard.ndjson, que pode ser importado em Stack Management > Saved Objects. A Figura 6 apresenta o resultado.'));
b.push(BLANK());
nFig += 0;
b.push(new Table({
  width: { size: 9070, type: WidthType.DXA }, columnWidths: [9070], borders: TableBorders.NONE,
  rows: [new TableRow({ cantSplit: true, children: [figCell('06-kibana-dashboard.png', 'Dashboard no Kibana com logs e métricas de requisições', 470, 367, 9070)] })],
}));
b.push(BLANK());

b.push(H1('5 Resultados e desafios'));
b.push(P('O pipeline executou com sucesso do commit até a implantação: os testes foram aprovados, a imagem foi publicada no registry e o chart Helm foi instalado no cluster, com o serviço respondendo no endpoint de saúde. O monitoramento indexou as requisições da aplicação no Elasticsearch com campos numéricos, o que permitiu construir os gráficos de status e de latência no Kibana. Os principais desafios enfrentados foram:'));
b.push(...alineas([
  'o nome da imagem no ghcr.io precisa estar em letras minúsculas, o que exigiu converter automaticamente o nome do repositório no workflow;',
  'os runners do GitHub não possuem cluster permanente, razão pela qual se utilizou um cluster Kind efêmero no job de deploy;',
  'as imagens do ghcr.io são privadas por padrão, o que exigiu a criação de um segredo de pull com o token do próprio workflow;',
  'o autodiscover do Filebeat não encontrou o container e o Docker utilizava o driver de log local, que não gera arquivos *-json.log; a solução foi fixar o driver json-file no Compose e ler os arquivos com o input container;',
  'o Elasticsearch rejeitava os eventos (erro 400), pois o campo service do log da aplicação, de tipo texto, conflitava com o campo service, de tipo objeto, do esquema ECS do Filebeat; o campo foi renomeado para app;',
  'o Elasticsearch consome muita memória, o que levou a limitar o heap a 512 MB e a utilizar o modo de nó único',
]));

b.push(H1('6 Considerações finais'));
b.push(P('A prática mostrou que a automação torna a entrega de software um processo repetível e previsível. O pipeline impede que qualquer alteração chegue ao cluster sem passar pelos testes; o versionamento da imagem pelo hash do commit permite rastrear exatamente o que está em execução e reverter uma versão com helm rollback; e o Helm padroniza a configuração da implantação. Com isso, reduzem-se os erros manuais e o tempo entre escrever e entregar o código cai de dias para minutos.'));
b.push(P('O monitoramento fecha o ciclo: logs estruturados e métricas de latência e de erro no Kibana fornecem feedback imediato sobre o comportamento real da aplicação, permitindo detectar regressões e gargalos antes que os usuários os percebam. Esse feedback realimenta o desenvolvimento, que é a essência da melhoria contínua defendida pelo DevOps e pelas metodologias ágeis (KIM et al., 2018).'));
b.push(P('Como limitações, destacam-se o esforço inicial de configuração, a necessidade de uma cultura colaborativa entre as equipes e os cuidados com segurança, como o gerenciamento de segredos, imagens e permissões, que também devem ser automatizados. Como trabalhos futuros, sugerem-se a implantação em um cluster permanente, a adoção de alertas no Kibana e a inclusão de varredura de vulnerabilidades no pipeline.'));

// ---------- referências ----------
const REF = (parts) => new Paragraph({ alignment: AlignmentType.LEFT, spacing: { line: 240, after: 240 }, children: parts });
const ref = [
  H1c('Referências'),
  REF([run('BECK, K. '), run('et al.', { italics: true }), run(' '), run('Manifesto para desenvolvimento ágil de software', { bold: true }), run('. 2001. Disponível em: https://agilemanifesto.org/iso/ptbr/manifesto.html. Acesso em: 12 nov. 2026.')]),
  REF([run('DOCKER. '), run('Docker documentation', { bold: true }), run('. 2026. Disponível em: https://docs.docker.com. Acesso em: 12 nov. 2026.')]),
  REF([run('ELASTIC. '), run('Filebeat reference', { bold: true }), run('. 2026. Disponível em: https://www.elastic.co/guide/en/beats/filebeat/current/index.html. Acesso em: 12 nov. 2026.')]),
  REF([run('GITHUB. '), run('GitHub Actions documentation', { bold: true }), run('. 2026. Disponível em: https://docs.github.com/actions. Acesso em: 12 nov. 2026.')]),
  REF([run('HELM. '), run('Helm documentation', { bold: true }), run('. 2026. Disponível em: https://helm.sh/docs. Acesso em: 12 nov. 2026.')]),
  REF([run('HUMBLE, J.; FARLEY, D. '), run('Entrega contínua', { bold: true }), run(': como entregar software de forma rápida e confiável. Porto Alegre: Bookman, 2014.')]),
  REF([run('KIM, G. '), run('et al.', { italics: true }), run(' '), run('Manual de DevOps', { bold: true }), run(': como obter agilidade, confiabilidade e segurança em organizações tecnológicas. Rio de Janeiro: Alta Books, 2018.')]),
  REF([run('KUBERNETES. '), run('Kubernetes documentation', { bold: true }), run('. 2026. Disponível em: https://kubernetes.io/docs. Acesso em: 12 nov. 2026.')]),
];

// ---------- apêndice ----------
const apend = [
  new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [run('APÊNDICE A – ROTEIRO DA APRESENTAÇÃO ORAL', { bold: true })] }),
  BLANK(),
  ...tabela('Roteiro da apresentação (10 minutos)', [
    ['Tempo', 'Conteúdo'],
    ['0:00 – 1:30', 'Conceitos: DevOps e métodos ágeis, CI/CD, máquinas virtuais e containers.'],
    ['1:30 – 4:00', 'Demonstração do pipeline no GitHub Actions: push, testes, build, registry e deploy.'],
    ['4:00 – 6:00', 'Chart Helm e serviço em execução no Kubernetes (kubectl get pods,svc).'],
    ['6:00 – 8:30', 'Kibana: geração de tráfego, logs em tempo real e métricas.'],
    ['8:30 – 10:00', 'Desafios enfrentados e reflexão crítica.'],
  ], [1800, 7270], 'Fonte: Elaborado pelos autores (2026).'),
];

// ---------- documento ----------
const pageBase = (extra = {}) => ({
  size: { width: 11906, height: 16838 },
  margin: { top: 1701, left: 1701, bottom: 1134, right: 1134, header: 1134 },
  ...extra,
});
const H = (sz, extra = {}) => ({ run: { font: FONT, size: sz, ...extra.run }, paragraph: { spacing: { before: 360, after: 360, line: 360 }, keepNext: true, ...extra.paragraph } });
const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, ...H(24, { run: { bold: true }, paragraph: { outlineLevel: 0 } }) },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, ...H(24, { run: { bold: true }, paragraph: { outlineLevel: 1 } }) },
    ],
  },
  numbering: { config: [{ reference: 'alinea', levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: '%1)', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1134, hanging: 425 } } } }] }] },
  sections: [
    { properties: { page: pageBase() }, children: [...capa, ...rosto, ...sumario] },
    {
      properties: { type: SectionType.NEXT_PAGE, page: pageBase({ pageNumbers: { start: 4 } }) },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 })] })] }) },
      children: [...b, ...ref, ...apend],
    },
  ],
});
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync('Relatorio_DevOps.docx', buf); console.log('ok'); });
