## Install
Clone this repository, run `npm install` and start developing!
```
    git clone https://github.com/ThijsKoot/snowproc.git
    cd snowproc
    npm install
```

Will be made available as a Node-package in the future. 

## Build
To start the build, open a terminal in the root of the directory and execute build.ps1. The generated procedures will be output to the `./built` folder.

The compilation process is as follows:
1. SnowProc looks for classes that inherit from Procedure and Arguments
2. Generate additional code for running in Snowflake
3. Concatenate all code including SnowProc libraries into a single file
4. Invoke Typescript-compiler to transpile to plain JavaScript
5. Add surrounding SQL-statement based on procedure and its properties