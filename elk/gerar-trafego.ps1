# Gera tráfego na aplicação para popular o dashboard do Kibana.
param([string]$Base = "http://localhost:3000", [int]$Rodadas = 60)
for ($i = 1; $i -le $Rodadas; $i++) {
  Invoke-RestMethod "$Base/health" | Out-Null
  Invoke-RestMethod "$Base/api/tarefas" | Out-Null
  Invoke-RestMethod -Method Post -Uri "$Base/api/tarefas" -ContentType "application/json" -Body (@{titulo="tarefa $i"} | ConvertTo-Json) | Out-Null
  try { Invoke-RestMethod "$Base/api/lento" | Out-Null } catch {}
  if ($i % 5 -eq 0) { try { Invoke-RestMethod "$Base/api/erro" | Out-Null } catch {} }
  if ($i % 7 -eq 0) { try { Invoke-RestMethod -Method Delete "$Base/api/tarefas/9999" | Out-Null } catch {} }
  Start-Sleep -Milliseconds 300
}
Write-Host "Tráfego gerado."
