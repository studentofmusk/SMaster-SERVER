import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { logErrorToFile } from "./logger.js";
dotenv.config();

export interface IMailOptions{
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;    
}

const EMAIL = process.env.EMAIL!;
const PASS = process.env.PASS!;

const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user: EMAIL,
        pass:PASS
    }
})


export const sendMail = async (mailOptions: IMailOptions): Promise<boolean> =>{
    try {
        await transporter.sendMail({
            from: `"${mailOptions.from}" <${EMAIL}>`, // sender address
            to: mailOptions.to, // list of receivers
            subject: mailOptions.subject, // Subject line
            text: mailOptions.text, // plain text body
            html: mailOptions.html??"", // html body
        });
        return true;
    } catch (error) {
        logErrorToFile(error as Error, "Error in Send Mail Function in Mailer");
        return false;
    }
}
  
export const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();
