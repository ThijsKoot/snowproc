npm install
tsc --outDir "tmp/compiler"
mkdir built -ErrorAction:SilentlyContinue | Out-Null 
node tmp/compiler/lib/compile.js tsconfig.json
Remove-Item -Path 'tmp' -Recurse