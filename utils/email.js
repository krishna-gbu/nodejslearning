const nodemailer = require('nodemailer')


const sendMail = async options =>{
    // 1  Create a transporter 
    const transport = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.USER_EMAIL,
            pass:process.env.USER_PASSWORD,
        }
    })

    /// define the email options
    const mailOptions = {
       from:'krishna nishad <hello@krishna.in>',
       to:options.email,
       subject:options.subject,
       text:options.message,
    //    html
    }

    //// 3) actualy send the email
    await transport.sendMail(mailOptions)
    
}


module.exports =  sendMail