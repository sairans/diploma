const nodeMailer = require('nodemailer');

const html = `
<h1>Заголовок</h1>
<p>Текст сообщения</p>
`;

async function main(){
    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'sajranovsanzar@gmail.com',
            pass: 'ymdz hotj ydny efua',
        }
    })
    const info = await transporter.sendMail({
        from: 'Sanzhar <sajranovsazar@gmail.com',
        to: 'qijkcedibinxnhdwug@ytnhy.com',
        subject: 'Hello',
        html: html,
    })

    console.log('Message sent: %s', info.messageId);
}

main()
.catch(e => console.error(e));