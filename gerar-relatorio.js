const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, LevelFormat, AlignmentType } = require('docx');

const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const P = (t) => new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun(t)] });
const B = (t) => new Paragraph({ numbering: { reference: 'b', level: 0 }, children: [new TextRun(t)] });
const CODE = (t) => new Paragraph({ spacing: { after: 60 }, shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' }, children: [new TextRun({ text: t, font: 'Consolas', size: 20 })] });
const PRINT = (t) => new Paragraph({ spacing: { before: 120, after: 200 }, border: { top: { style: 'single', size: 6, color: '999999', space: 4 }, bottom: { style: 'single', size: 6, color: '999999', space: 4 }, left: { style: 'single', size: 6, color: '999999', space: 4 }, right: { style: 'single', size: 6, color: '999999', space: 4 } }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: `[ INSERIR PRINT: ${t} ]`, italics: true, color: '888888' })] });

const { ImageRun, TableBorders } = require('docx');
const NB = { style: 'none', size: 0, color: 'FFFFFF' };
const noB = { top: NB, bottom: NB, left: NB, right: NB };
const img = (f) => new ImageRun({ type: 'jpg', data: fs.readFileSync('docs/prints/' + f), transformation: { width: 210, height: 398 } });
const cap = (t) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: t, italics: true, size: 18 })] });
const pair = (a, ta, b, tb) => new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [4680, 4680], borders: TableBorders.NONE, rows: [new TableRow({ children: [[a, ta], [b, tb]].filter((x) => x[0]).map(([f, t]) => new TableCell({ width: { size: 4680, type: WidthType.DXA }, borders: noB, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [img(f)] }), cap(t)] })) })] });
const cell = (t, w, head) => new TableCell({ width: { size: w, type: WidthType.DXA }, shading: head ? { type: ShadingType.CLEAR, fill: 'D9E2F3' } : undefined, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: t, bold: head })] })] });
const table = (rows, widths) => new Table({ width: { size: widths.reduce((a, b) => a + b), type: WidthType.DXA }, columnWidths: widths, rows: rows.map((r, i) => new TableRow({ children: r.map((c, j) => cell(c, widths[j], i === 0)) })) });

const c = [];
c.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('Atividade Final – DevOps na Prática')] }));
c.push(P('Disciplina: DevOps Tools    |    Grupo: [nomes dos integrantes]    |    Repositório: https://github.com/leao-leao/devops-atividade-final (privado)'));

c.push(H1('Etapa 1 – Conceitos Fundamentais de DevOps'));
c.push(H2('1.1 O que é DevOps e sua relação com Metodologias Ágeis'));
c.push(P('DevOps é uma cultura e um conjunto de práticas que integra desenvolvimento (Dev) e operações (Ops) para entregar software com mais rapidez, frequência e confiabilidade. Em vez de times isolados que "jogam o código por cima do muro", desenvolvedores e operações compartilham responsabilidade pelo produto durante todo o seu ciclo de vida, apoiados por automação (CI/CD), infraestrutura como código, monitoramento e feedback contínuo.'));
c.push(P('As metodologias ágeis (Scrum, Kanban, XP) resolvem o problema de planejar e desenvolver em ciclos curtos, respondendo rápido a mudanças. Porém, de nada adianta o time ágil produzir uma funcionalidade a cada sprint se ela leva semanas para chegar em produção. DevOps estende o ágil "para a direita": leva a mesma mentalidade de ciclos curtos, colaboração e melhoria contínua até a entrega e a operação. Ágil acelera o desenvolvimento; DevOps acelera e estabiliza a entrega.'));
c.push(P('Analogia: o ágil é uma cozinha que prepara pratos rapidamente em pequenas porções; o DevOps é o sistema que leva cada prato quente até a mesa, com garçons treinados, padronização e avaliação constante dos clientes.'));
c.push(H2('1.2 Diferença entre CI, CD (Delivery) e CD (Deployment)'));
c.push(table([
  ['Prática', 'O que faz', 'Quem aprova a ida para produção?'],
  ['CI – Integração Contínua', 'A cada commit/push, o código é integrado, compilado e testado automaticamente, detectando erros cedo.', 'Não chega a produção; valida o código.'],
  ['CD – Continuous Delivery (Entrega Contínua)', 'Estende o CI: todo código aprovado fica pronto para produção (artefato/imagem gerado e implantável a qualquer momento).', 'Uma pessoa, com um clique/aprovação manual.'],
  ['CD – Continuous Deployment (Implantação Contínua)', 'Vai além: toda mudança que passa nos testes é publicada em produção automaticamente.', 'Ninguém; totalmente automático.'],
], [2400, 4200, 2760]));
c.push(P(' '));
c.push(P('Neste trabalho: o job "ci" do GitHub Actions executa testes, constrói a imagem e publica no registry (CI + entrega do artefato); o job "deploy" implanta no Kubernetes via Helm automaticamente a cada push na main (Continuous Deployment).'));
c.push(H2('1.3 Máquinas virtuais vs containers'));
c.push(table([
  ['Aspecto', 'Máquina virtual', 'Container'],
  ['Isolamento', 'Sistema operacional completo por VM, sobre um hypervisor.', 'Processos isolados que compartilham o kernel do host.'],
  ['Tamanho', 'GBs.', 'MBs (ex.: node:20-alpine).'],
  ['Inicialização', 'Minutos.', 'Segundos ou menos.'],
  ['Consumo de recursos', 'Alto (cada VM carrega um SO).', 'Baixo; muito mais containers por servidor.'],
  ['Portabilidade', 'Imagens pesadas e dependentes do hypervisor.', '"Funciona na minha máquina" = funciona em qualquer lugar com um runtime de containers.'],
], [2000, 3680, 3680]));
c.push(P(' '));
c.push(P('Vantagens dos containers: ambientes idênticos do desenvolvimento à produção, builds reproduzíveis, deploys rápidos, escalonamento horizontal simples e melhor aproveitamento de hardware. Analogia: uma VM é uma casa inteira com sua própria fundação, encanamento e energia; containers são apartamentos em um prédio, que compartilham a estrutura (kernel) mas têm cada um sua unidade isolada.'));

c.push(H1('Etapa 2 – Integração Contínua e Entrega Contínua'));
c.push(P('Foi criada uma API REST de tarefas em Node.js/Express (pasta app/) com os endpoints /health, /api/tarefas (GET, POST, DELETE), /api/lento e /api/erro (estes dois geram latência e erros para o dashboard). Cada requisição gera um log JSON com método, caminho, status_code e response_time_ms.'));
c.push(P('O pipeline está em .github/workflows/main.yml e é disparado em push e pull request na main. O job "ci" executa:'));
c.push(B('Instalação das dependências e testes automatizados (npm test, 5 testes com node:test);'));
c.push(B('Build da imagem Docker (app/Dockerfile, baseada em node:20-alpine, executando como usuário não-root e com HEALTHCHECK);'));
c.push(B('Push da imagem para o GitHub Container Registry (ghcr.io), com tags do SHA do commit e latest (somente em push na main).'));
c.push(pair('01-pipeline-sucesso.jpg', 'Figura 1 – Pipeline CI-CD executado com sucesso (jobs ci e deploy, 2m5s)', '02-ci-testes.jpg', 'Figura 2 – Job ci: 5 testes automatizados aprovados'));
c.push(P(' '));
c.push(pair('05-imagem-ghcr.jpg', 'Figura 3 – Imagem publicada no GitHub Container Registry (ghcr.io)'));

c.push(H1('Etapa 3 – Continuous Deployment + Orquestração'));
c.push(P('O diretório helm/tarefas-api contém o chart (Chart.yaml, values.yaml e templates de Deployment, Service e Ingress opcional). O Deployment roda 2 réplicas com readiness/liveness probes em /health e limites de recursos. O Service é do tipo NodePort (porta 30080); o Ingress pode ser habilitado em values.yaml (ingress.enabled=true).'));
c.push(P('O job "deploy" do pipeline roda após o CI: cria um cluster Kind efêmero no runner, cria o secret de pull do GHCR e executa "helm upgrade --install" com a tag igual ao SHA do commit (nova versão a cada push), aguardando o rollout (--wait) e testando o serviço via NodePort com curl. Para deploy em um Minikube/Kind local, usa-se o mesmo chart:'));
c.push(CODE('kind create cluster'));
c.push(CODE('helm upgrade --install tarefas-api ./helm/tarefas-api --set image.repository=ghcr.io/<usuario>/<repo> --set image.tag=latest'));
c.push(CODE('kubectl get pods,svc'));
c.push(pair('03-deploy-helm.jpg', 'Figura 4 – helm upgrade --install no cluster Kubernetes (STATUS: deployed)', '04-kubernetes-pods-svc.jpg', 'Figura 5 – kubectl get pods,svc: 2 pods Running, serviço NodePort 80:30080 e resposta {"status":"ok"}'));

c.push(H1('Etapa 4 – Logging e Métricas'));
c.push(P('A pasta elk/ possui um docker-compose.yml com a aplicação, Elasticsearch, Kibana e Filebeat (versão 8.13.4). Para subir: "docker compose up -d --build" dentro de elk/, e depois "./gerar-trafego.ps1" para gerar requisições.'));
c.push(H2('Como o Filebeat coletou os dados'));
c.push(B('A aplicação escreve cada log em JSON na saída padrão (stdout); o Docker grava isso em /var/lib/docker/containers/<id>/*.log.'));
c.push(B('O Filebeat monta esse diretório (somente leitura) e o docker.sock, e usa autodiscover do provider "docker": só coleta containers com a label co.elastic.logs/enabled=true (a aplicação).'));
c.push(B('O processador decode_json_fields transforma o campo "message" (texto JSON) em campos individuais: status_code, response_time_ms, method, path, level.'));
c.push(B('O Filebeat envia os eventos ao Elasticsearch no índice tarefas-api-logs-AAAA.MM.DD, que o Kibana lê por meio de um Data View (padrão tarefas-api-logs-*).'));
c.push(H2('Dashboard no Kibana (http://localhost:5601)'));
c.push(B('Logs em tempo real: Discover (ou Observability > Logs) com o Data View tarefas-api-logs-*, atualização automática ligada.'));
c.push(B('Métricas de requisições: Dashboard com (a) gráfico de barras/rosca com contagem por status_code; (b) linha com média e percentil 95 de response_time_ms ao longo do tempo; (c) tabela por path.'));
c.push(PRINT('dashboard do Kibana com logs e métricas'));

c.push(H1('Etapa 5 – Relatório Final'));
c.push(H2('5.1 Passo a passo da implementação'));
[
  'Criação do repositório no GitHub e da aplicação Node.js com testes automatizados.',
  'Criação do Dockerfile e validação do build.',
  'Escrita do workflow main.yml (testes, build, push no GHCR).',
  'Criação do chart Helm e adição do job de deploy no pipeline.',
  'Subida da stack Filebeat + Elasticsearch + Kibana e criação do dashboard.',
  'Geração de tráfego e coleta dos prints para o relatório.',
].forEach((t) => c.push(B(t)));
c.push(H2('5.2 Desafios enfrentados (ajuste conforme a experiência real do grupo)'));
[
  'O nome da imagem no GHCR precisa estar em minúsculas; o workflow converte o nome do repositório automaticamente.',
  'Em runners do GitHub não existe um cluster permanente; foi usado Kind efêmero no job de deploy para demonstrar o CD de ponta a ponta.',
  'Imagens do GHCR são privadas por padrão; foi criado um imagePullSecret com o GITHUB_TOKEN.',
  'Os logs chegavam ao Elasticsearch como texto único; foi necessário decodificar o JSON no Filebeat para ter status_code e response_time_ms como campos numéricos agregáveis.',
  'O Elasticsearch consome bastante memória; foi limitado o heap a 512 MB e usado modo single-node.',
].forEach((t) => c.push(B(t)));
c.push(H2('5.3 Reflexão crítica: como o DevOps agrega valor ao ciclo de vida do software'));
c.push(P('A prática mostrou que a automação transforma a entrega de software em um processo repetível e previsível. O pipeline garante que nenhuma mudança chegue ao cluster sem passar pelos testes; o versionamento da imagem pelo SHA do commit permite rastrear exatamente o que está rodando e reverter com "helm rollback"; e o Helm padroniza a configuração do deploy. Com isso, reduzem-se erros manuais, o tempo entre escrever e entregar código cai de dias para minutos e o retrabalho diminui.'));
c.push(P('O monitoramento fecha o ciclo: logs estruturados e métricas de latência e erro no Kibana dão feedback imediato sobre o comportamento real da aplicação, permitindo detectar regressões e gargalos antes que os usuários reclamem. Esse feedback realimenta o desenvolvimento, que é a essência da melhoria contínua defendida por DevOps e pelas metodologias ágeis. Como limitações, vale citar o esforço inicial de configuração, a necessidade de cultura colaborativa e os cuidados de segurança (segredos, imagens e permissões), que também devem ser automatizados (DevSecOps).'));
c.push(H2('5.4 Roteiro da apresentação (até 10 minutos)'));
c.push(table([
  ['Tempo', 'Conteúdo'],
  ['0:00 – 1:30', 'Conceitos: DevOps x ágil, CI/CD, VMs x containers.'],
  ['1:30 – 4:00', 'Demonstração do pipeline no GitHub Actions (push → testes → build → registry → deploy).'],
  ['4:00 – 6:00', 'Chart Helm e serviço rodando no Kubernetes (kubectl get pods,svc).'],
  ['6:00 – 8:30', 'Kibana: gerar tráfego e mostrar logs em tempo real e métricas.'],
  ['8:30 – 10:00', 'Desafios e reflexão crítica.'],
], [1800, 7560]));

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { font: 'Arial', size: 44, bold: true }, paragraph: { spacing: { before: 0, after: 200 } } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 32, bold: true, color: '1F3864' }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 26, bold: true, color: '2F5496' }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1273, bottom: 1440, left: 1273 } } }, children: c }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync('Relatorio_DevOps.docx', b); console.log('ok'); });
