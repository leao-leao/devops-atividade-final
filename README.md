# Atividade Final – DevOps na Prática

Projeto com pipeline CI/CD (GitHub Actions), implantação em Kubernetes com Helm e monitoramento de logs e métricas com Filebeat, Elasticsearch e Kibana.

Autores: Alan dos Anjos Leão e Lucas Soares Vilhena – UNAMA, Ciência da Computação.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `app/` | API Node.js de tarefas, com testes e Dockerfile |
| `.github/workflows/main.yml` | Pipeline CI/CD (testes, build, registry e deploy) |
| `helm/tarefas-api/` | Chart Helm (Deployment, Service e Ingress opcional) |
| `elk/` | Docker Compose com a aplicação, Filebeat, Elasticsearch e Kibana |
| `elk/kibana-dashboard.ndjson` | Dashboard do Kibana, para importar |

## Como instalar e rodar em outro computador

### Requisitos

- [Git](https://git-scm.com)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ligado, com pelo menos 4 GB de RAM livres
- Portas livres: `3000` (aplicação), `5601` (Kibana) e `9200` (Elasticsearch)
- Internet na primeira execução (baixa as imagens da Elastic)

### 1. Baixar o projeto

```bash
git clone https://github.com/leao-leao/devops-atividade-final.git
cd devops-atividade-final/elk
```

### 2. Subir a aplicação e o monitoramento

```bash
docker compose up -d --build
```

A imagem da aplicação é construída a partir do código-fonte, então não é preciso login no GitHub Container Registry. Espere cerca de 1 minuto até o Kibana responder.

Conferir:

```bash
docker compose ps
curl http://localhost:3000/health
```

### 3. Importar o dashboard no Kibana (obrigatório)

Windows (PowerShell), dentro da pasta `elk`:

```powershell
curl.exe -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true" -H "kbn-xsrf: true" -F "file=@kibana-dashboard.ndjson"
```

Linux ou Mac:

```bash
curl -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true" -H "kbn-xsrf: true" -F "file=@kibana-dashboard.ndjson"
```

Também é possível importar pela interface: Kibana > Stack Management > Saved Objects > Import.

### 4. Gerar tráfego e abrir o dashboard

Windows (PowerShell):

```powershell
.\gerar-trafego.ps1 -Rodadas 40
```

Linux ou Mac:

```bash
for i in $(seq 1 40); do
  curl -s localhost:3000/health >/dev/null
  curl -s localhost:3000/api/tarefas >/dev/null
  curl -s localhost:3000/api/lento >/dev/null
  curl -s localhost:3000/api/erro >/dev/null
  sleep 0.3
done
```

Abra o dashboard: <http://localhost:5601/app/dashboards#/view/dash-devops>

Se os gráficos ficarem vazios, aumente o intervalo de tempo (canto superior direito) para "Last 24 hours" e clique em Refresh.

### 5. Desligar

```bash
docker compose down
```

> Antes do push: ajuste `image.repository` em `helm/tarefas-api/values.yaml`.

## Testes da aplicação

Requer Node.js 18 ou superior.

```bash
cd app
npm install
npm test
```

## Kubernetes com Helm (opcional)

Requer [Kind](https://kind.sigs.k8s.io), [Helm](https://helm.sh) e `kubectl`. Como o pacote da imagem no `ghcr.io` é privado, construa a imagem localmente e carregue no cluster:

```bash
docker build -t tarefas-api:local app
kind create cluster
kind load docker-image tarefas-api:local
helm upgrade --install tarefas-api helm/tarefas-api \
  --set image.repository=tarefas-api --set image.tag=local --set image.pullPolicy=Never
kubectl get pods,svc
```

O serviço é do tipo NodePort (porta `30080`). Para testar a partir da sua máquina:

```bash
kubectl port-forward svc/tarefas-api 8080:80
curl http://localhost:8080/health
```

## Pipeline CI/CD

O pipeline (`.github/workflows/main.yml`) roda no GitHub a cada push na `main`:

1. **ci**: instala dependências, roda os testes, constrói a imagem Docker e publica no `ghcr.io`.
2. **deploy**: cria um cluster Kind no runner e instala o chart Helm com a imagem do commit.

Não é preciso instalar nada localmente para o pipeline funcionar.

