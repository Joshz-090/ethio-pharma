cd c:\Users\hp\StudioProjects\ethio_pharma_pos\temp_repo\ethio-pharma
git checkout -b update-pos-app-ui
Remove-Item -Recurse -Force pos_app\* -ErrorAction SilentlyContinue
robocopy ..\.. pos_app /MIR /XD backend temp_repo .git .idea .dart_tool build frontend scratch android\app\build windows_old /XF "Ethio-Pharma MedLink API (1).yaml" "hs_err_*.log"
git add pos_app
git commit -m "Update pos_app with refined UI, reservation logic, and distance formatting"
