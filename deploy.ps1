$envId = "cloud-d3gbi9e14940c4306"
$root = "cloudfunctions"

tcb fn deploy pair --env-id $envId --dir (Join-Path $root "pair") --yes
tcb fn deploy dataOps --env-id $envId --dir (Join-Path $root "dataOps") --yes
tcb fn deploy ai --env-id $envId --dir (Join-Path $root "ai") --yes
tcb fn deploy initDb --env-id $envId --dir (Join-Path $root "initDb") --yes

Write-Host "DEPLOY_DONE"
