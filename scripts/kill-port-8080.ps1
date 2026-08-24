try {
    $owners = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if (-not $owners) {
        Write-Output "No processes found listening on port 8080."
        exit 0
    }
    foreach ($pid in $owners) {
        try {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Output "Killing process $($proc.Id) ($($proc.ProcessName)) listening on port 8080..."
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Output "Killed $($proc.Id)."
            }
        } catch {
            Write-Output "Failed to kill PID $pid: $_"
        }
    }
} catch {
    Write-Output "Error checking port 8080: $_"
    exit 1
}
