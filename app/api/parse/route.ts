import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const text = await file.text()
    
    // Path to python script
    const pythonScriptPath = path.join(process.cwd(), "lib", "python", "parser.py")
    
    // Spawn python process
    const pythonProcess = spawn("python", [pythonScriptPath])
    
    let resultData = ""
    let errorData = ""
    
    // Write text to stdin
    pythonProcess.stdin.write(text)
    pythonProcess.stdin.end()
    
    // Collect output from stdout
    const stdoutPromise = new Promise<string>((resolve, reject) => {
      pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString()
      })
      pythonProcess.stdout.on("close", () => resolve(resultData))
    })
    
    // Collect output from stderr
    const stderrPromise = new Promise<string>((resolve, reject) => {
      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString()
      })
      pythonProcess.stderr.on("close", () => resolve(errorData))
    })
    
    const exitCodePromise = new Promise<number>((resolve) => {
      pythonProcess.on("close", (code) => resolve(code ?? 0))
    })
    
    await Promise.all([stdoutPromise, stderrPromise, exitCodePromise])
    
    if (errorData) {
      console.error("Python Error:", errorData)
    }
    
    const parsedData = JSON.parse(resultData)
    
    return NextResponse.json({ success: true, data: parsedData })
  } catch (error) {
    console.error("Parsing API Error:", error)
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 })
  }
}
