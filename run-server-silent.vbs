Set objShell = CreateObject("WScript.Shell")
strBatchFile = "E:\TaskMasterPro70\TaskMasterPro70\run-server.bat"

' Write startup log with timestamp
Set fso = CreateObject("Scripting.FileSystemObject")
logFile = "E:\TaskMasterPro70\TaskMasterPro70\startup.log"
Set objFile = fso.CreateTextFile(logFile, True)
objFile.WriteLine "TaskMasterPro Server startup initiated at: " & Now
objFile.WriteLine "Waiting 10 seconds before starting (prevents restart loops)..."
objFile.Close

' Wait 10 seconds to allow system to fully boot
WScript.Sleep(10000)

' Run the batch file with no visible window
objShell.Run strBatchFile, 0, False

' Update log
Set objFile = fso.OpenTextFile(logFile, 8)
objFile.WriteLine "Startup script completed at: " & Now
objFile.Close
