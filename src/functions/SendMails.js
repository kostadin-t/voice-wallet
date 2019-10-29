// const nodemailer = require('nodemailer');

// export default class SendMails{
//     constructor() {
//         this.user = 'kocyo.terziev@gmail.com';
//         this.password = '';
//         this.transporter = nodemailer.createTransport({
//             host: 'smtp.ethereal.email',
//             port: 587,
//             secure: false, // true for 465, false for other ports
//             auth: {
//             user: this.user, // generated ethereal user
//             pass: this.password // generated ethereal password
//             }
//         });
//     }

//     async sendMail() {
//         let info = await transporter.sendMail({
//             from: `"Kostadin Terziev 👻 <kocyo.terziev@gmail.com>`, // sender address
//             to: 'kocyo.terziev@gmail.com', // list of receivers
//             subject: 'Hello ✔', // Subject line
//             text: 'Hello world?', // plain text body
//             html: '<b>Hello world?</b>' // html body
//         });
//     }
// }