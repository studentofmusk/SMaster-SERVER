import fs from 'fs';
import path from 'path';

// Function to log errors to a file
export const logErrorToFile = (error: Error, customMessage: string): void => {
    const logFilePath = path.join(__dirname, "../../logs/errors.log");

    const logMessage = `
    [${new Date().toISOString()}] ${customMessage}
    Error Message: ${error.message}
    Stack Trace: ${error.stack}
    ----------------------------------
    `;

    // Ensure logs directory exists
    if(!fs.existsSync(path.dirname(logFilePath))){
        fs.mkdirSync(path.dirname(logFilePath), {recursive: true});
    }

    // Append the error to the log file
    fs.appendFile(logFilePath, logMessage, (err)=>{
        if (err){
            console.error("Failed to write error log:", err);
        }
    })
}