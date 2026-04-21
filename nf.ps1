param (
    [Parameter(Mandatory=$true)]
    [string]$NomFichier
)

$Destination = "C:\xampp\htdocs\Defi_Web\ccmarket\frontend"
New-Item -Path "$Destination\html\$($NomFichier).html" -ItemType File
New-Item -Path "$Destination\css\$($NomFichier).css" -ItemType File
New-Item -Path "$Destination\js\$($NomFichier).js" -ItemType File
