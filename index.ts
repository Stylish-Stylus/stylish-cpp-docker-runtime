import { ServerWebSocket } from "bun"
import {exec} from "child_process"
import fs from "fs";


function execute(command: string, callback: any, ws: ServerWebSocket<unknown>) {
    let ls = exec(command,callback);

    if (ls.stdout === null || ls.stderr === null){
        console.log("Stdout is null");
        return;
    }

    let buffer = '';

    ls.stdout.on('data', (data) => {
        buffer += data.toString();
    
        // Split the buffer into lines
        const lines = buffer.split('\n');
    
        // Process complete lines, keeping the last incomplete line in the buffer
        for (let i = 0; i < lines.length - 1; i++) {
        console.log(`stdout: ${lines[i]}`);
        }
    
        // Save the last incomplete line in the buffer for the next iteration
        buffer = lines[lines.length - 1];
    });
    
    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    
    ls.on('close', (code) => {
        // Process any remaining incomplete line in the buffer
        if (buffer.trim() !== '') {
        console.log(`stdout: ${buffer}`);
        }
    
        console.log(`child process exited with code ${code}`);
    });

    ws.send(buffer);

}

function logResult(output: any) {

    output.stdout?.on("data", (data:any) => {
        // ws.send(data.toString());
        console.log("LOG: ",data.toString());

      });
}



const server = Bun.serve({
    port: 3001,
    fetch (request, server) {
        if (server.upgrade(request)){
            return;
        }

        
        return new Response("Hello Bun");
    }, 
    websocket: {
        open(ws) {
            console.log("connection open");
            ws.send("Connected");
        },
        message(ws, message) {
            
            let body = JSON.parse(String(message));
            console.log("incoming message",body.emit);

            switch (body.emit) {
                
                case "new-project":
                    execute(
                        "mkdir projects && cd projects && cargo stylus new project > output.txt 2>&1",
                        logResult,
                        ws
                    );

                    ws.send("code compiled");
                    break;


                case "compile-project":
                    // fs.writeFileSync("./projects/project/src/main.rs", body.main);
                    // fs.writeFileSync("./projects/project/src/lib.rs", body.lib);

                    execute(
                        "cd projects && cd project && cargo stylus check > output.txt 2>&1",
                        logResult,
                        ws
                    );

                    ws.send("Completed");
                    break;
                
                case "get-abi":
                    execute(
                        "cd projects && cd project && cargo stylus export-abi --json > abi.json 2>&1",
                        logResult,
                        ws
                    );
                    ws.send("Created");
                    break;

                
                default:
                    ws.send("Invalid Event");

            }


        },
        close(ws){
            console.log("connection closed");
            ws.send("Closed");
        }
    }
})
