@echo off
setlocal
set "ROOT=%~dp0.."
start "" "%ROOT%\docs\product-hunt\one-click-launch.html"
start "" "https://www.producthunt.com/posts/new"
endlocal
