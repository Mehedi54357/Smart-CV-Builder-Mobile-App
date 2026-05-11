Add-Type -AssemblyName System.Drawing
$files = @('icon.png', 'splash.png', 'adaptive-icon.png')
foreach ($f in $files) {
    $path = "d:\SmartCV_Builder_Pro_COMPLETE\smartcv-project\frontend\assets\$f"
    $newPath = "d:\SmartCV_Builder_Pro_COMPLETE\smartcv-project\frontend\assets\new_$f"
    $img = [System.Drawing.Image]::FromFile($path)
    $img.Save($newPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    Move-Item $newPath $path -Force
}
