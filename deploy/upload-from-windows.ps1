# Upload project to GCP VM from Windows (run in PowerShell)
# Prerequisites: gcloud CLI installed and authenticated (gcloud auth login)

param(
    [Parameter(Mandatory = $true)]
    [string]$VmName = "altons-carwash",

    [Parameter(Mandatory = $true)]
    [string]$Zone = "us-central1-a",

    [string]$ProjectPath = "$PSScriptRoot\.."
)

$ProjectPath = Resolve-Path $ProjectPath

Write-Host "Uploading from: $ProjectPath"
Write-Host "To VM: $VmName (zone: $Zone)"
Write-Host ""

# Exclude heavy folders
$remoteTmp = "/tmp/altons-carwash-upload"

gcloud compute ssh $VmName --zone=$Zone --command="rm -rf $remoteTmp && mkdir -p $remoteTmp"

# Use tar to exclude node_modules and .next
Push-Location $ProjectPath
tar --exclude=node_modules --exclude=.next --exclude=prisma/dev.db -czf "$env:TEMP\altons-carwash.tar.gz" .
Pop-Location

gcloud compute scp "$env:TEMP\altons-carwash.tar.gz" "${VmName}:${remoteTmp}/app.tar.gz" --zone=$Zone

gcloud compute ssh $VmName --zone=$Zone --command=@"
sudo mkdir -p /var/www/altons-carwash
sudo tar -xzf $remoteTmp/app.tar.gz -C /var/www/altons-carwash
sudo chown -R `$USER:`$USER /var/www/altons-carwash
chmod +x /var/www/altons-carwash/deploy/*.sh
rm -rf $remoteTmp
echo 'Upload complete. SSH in and run: cd /var/www/altons-carwash && ./deploy/deploy.sh'
"@

Write-Host ""
Write-Host "Done. Next on the VM:"
Write-Host "  gcloud compute ssh $VmName --zone=$Zone"
Write-Host "  cd /var/www/altons-carwash"
Write-Host "  cp deploy/.env.production.example .env && nano .env"
Write-Host "  ./deploy/deploy.sh"
