var db = require('../config/db');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'testengine82@gmail.com',
    pass: 'DigitalLync@123'
  }
});

// Admin SignIn
exports.adminSignIn = function (req, res){
    console.log(req.body);
    console.log("from adminSignIn");
    const {emailID, password} = req.body
    if(!emailID || !password){
       return res.status(422).json({
           status: "failed",
           error:"Please add emailID and password"
        })
    }
     let sql = 'SELECT * from asm_admin where email_id = ? '   
    
    db.query(sql, [emailID], (err, rows, fields)=>{
        if(err) 
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID or password"
            });

        else if(rows.length === 0)
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID or password"
                });
        else if(rows.length === 1){
            let hashedPassword = rows[0].password;
            bcrypt.compare(password, hashedPassword, function(err2, bcresult) {
                logger.info('err2 =', err2);
                logger.info("bcresult=", bcresult);
                //If password matched
                if(bcresult == true){
                    const token = jwt.sign({email_id}, 'my-secret-key');
                    return res.status(200).json(
                    //     {
                    //     status: 'success',
                    //     customer: result[0],
                    //     token
                    // }
                    {status: "success", token, emailID}
                    );
                }
                else{
                    //If password not matched
                    return res.status(502).json({
                        status: 'failed',
                        message: 'Invalid email id or password.'
                    });
                }
            });

            // const token = jwt.sign({emailID}, 'my-secret-key');
            // res.json({status: "success", token, emailID})
        }
    });
}

// Admin Change Password
exports.changeAdminPassword = function (req, res){
    console.log(req.body);
    const {emailID, oldPassword, newPassword} = req.body
    if(!emailID || !oldPassword || !newPassword){
       return res.status(422).json({
           status: "failed",
           error:"Please provide emailID, old password and new password"
        })
    }
    if(newPassword.length === 0 || newPassword.length<4)
        return res.status(422).json({
            status: "failed",
            error:"New password is too short"
        })
    if(oldPassword === newPassword)
        return res.status(422).json({
            status: "failed",
            error:"While change password,  old password and new password should not be same"
        })
    let sql = 'SELECT * from asm_admin where email_id = ? '
    
    db.query(sql, [emailID], (err, rows, fields)=>{
        if(err) 
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID "
            });

        else if(rows.length === 0 || rows[0].password !== oldPassword)
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID or password"
                });
        else{
            db.query("UPDATE asm_admin SET password = ? where email_id= ? ", 
                [newPassword, emailID], function (err, rows) {
                    if(err) 
                        return res.status(422).json({
                            status: "failed",
                            error: err.message
                        });
                    console.log(rows);
                    res.json({ 
                        status: "success", 
                        msg: "Password is changed successfully"
                    });
            })
        }
    });
}
// Admin forgot password
exports.adminForgotPassword = function (req, res){
    console.log(req.body);
    console.log("from Forgotpassword");
    const {emailID } = req.body
    if(!emailID){
       return res.status(422).json({
           status: "failed",
           error:"Please Enter proper emailID"
        })
    }
     let sql = 'SELECT * from asm_admin where email_id = ? '   
    
    db.query(sql, [emailID], (err, rows, fields)=>{
        console.log("err:",err);
        console.log("rows length :",rows)
        if(err) 
            return res.status(422).json({
                status: "failed",
                error:"Invalid EmailID "
            });

        else if(rows.length === 0)
                return res.status(422).json({
                    status: "failed",
                    error:"Invalid EmailID"
                });
        else{
            // const token = jwt.sign({emailID}, 'my-secret-key');
            // res.json({status: "success", token, emailID})
            var mailOptions = {
                from: 'testengine82@gmail.com',               
                to :emailID,
                subject: 'Reset Password',
                html: `
                
                    <h1>This is the final email</h1>
              
                    <a href="http://localhost:4200/forgot-confirm-password">Click here</a>
              
        
                
                `
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  res.send({status:true});                }
              });
              

        }
    });
}

