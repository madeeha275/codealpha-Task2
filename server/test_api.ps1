# Register user (ignore if exists)
$registerBody = @{ name = "TestUser"; email = "testuser@example.com"; password = "Password123" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/register -Body $registerBody -ContentType "application/json" -ErrorAction SilentlyContinue

# Login
$loginBody = @{ email = "testuser@example.com"; password = "Password123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/login -Body $loginBody -ContentType "application/json"
$token = $loginResp.token
Write-Host "TOKEN=$token"

$headers = @{ Authorization = "Bearer $token" }

# Get projects (should be empty)
$projects = Invoke-RestMethod -Headers $headers -Uri http://127.0.0.1:5000/api/projects
Write-Host "PROJECTS:" ($projects | ConvertTo-Json -Compress)

# Create project
$newProjectBody = @{ name = "Demo Project"; description = "Demo"; color = "#ff0000" } | ConvertTo-Json
$newProject = Invoke-RestMethod -Headers $headers -Method Post -Uri http://127.0.0.1:5000/api/projects -Body $newProjectBody -ContentType "application/json"
Write-Host "NEWPROJECT:" ($newProject | ConvertTo-Json -Compress)
$projId = $newProject._id

# Get project details
$projDetail = Invoke-RestMethod -Headers $headers -Uri "http://127.0.0.1:5000/api/projects/$projId"
Write-Host "PROJECTDETAIL:" ($projDetail | ConvertTo-Json -Compress)
$columnId = $projDetail.columns[0]._id

# Create task
$newTaskBody = @{ title = "Task 1"; columnId = $columnId } | ConvertTo-Json
$newTask = Invoke-RestMethod -Headers $headers -Method Post -Uri "http://127.0.0.1:5000/api/projects/$projId/tasks" -Body $newTaskBody -ContentType "application/json"
Write-Host "NEWTASK:" ($newTask | ConvertTo-Json -Compress)
$taskId = $newTask._id

# Get tasks for project
$projTasks = Invoke-RestMethod -Headers $headers -Uri "http://127.0.0.1:5000/api/projects/$projId/tasks"
Write-Host "PROJECTTASKS:" ($projTasks | ConvertTo-Json -Compress)

# Update task
$updateBody = @{ title = "Task 1 Updated" } | ConvertTo-Json
$updatedTask = Invoke-RestMethod -Headers $headers -Method Put -Uri "http://127.0.0.1:5000/api/tasks/$taskId" -Body $updateBody -ContentType "application/json"
Write-Host "UPDATEDTASK:" ($updatedTask | ConvertTo-Json -Compress)

# Move task
$moveBody = @{ columnId = $columnId; newOrder = 1 } | ConvertTo-Json
$movedTask = Invoke-RestMethod -Headers $headers -Method Patch -Uri "http://127.0.0.1:5000/api/tasks/$taskId/move" -Body $moveBody -ContentType "application/json"
Write-Host "MOVEDTASK:" ($movedTask | ConvertTo-Json -Compress)

# Delete task
$delResp = Invoke-RestMethod -Headers $headers -Method Delete -Uri "http://127.0.0.1:5000/api/tasks/$taskId"
Write-Host "DELETED:" ($delResp | ConvertTo-Json -Compress)

