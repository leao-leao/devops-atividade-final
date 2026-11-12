# Atividade Final – DevOps na Prática

- `app/` – API Node.js : `npm install && npm test`
- `.github/workflows/main.yml` – pipeline CI/CD 
- `helm/tarefas-api/` – chart Helm 
- `elk/` – Filebeat + Elasticsearch + Kibana (Etapa 4): `docker compose up -d --build` e `./gerar-trafego.ps1`

Antes do push: ajuste `image.repository` em `helm/tarefas-api/values.yaml`

Dashboard Kibana: importe elk/kibana-dashboard.ndjson (Stack Management > Saved Objects > Import).
