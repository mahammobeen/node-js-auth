 
 const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = async(req,res)=>{
    try{
          const {username, email,password, role} = req.body;

          const checkExistingUser = await User.findOne({$or: [{username}, {email}]})
          if(checkExistingUser){
            return res.status(400).json({
              success: false,
             message: 'user already exist try with different username',

            })
          }

                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash( password ,salt)

                const newlyCreatedUser = new User({
                    username,
                    email,
                    password: hashedPassword,
                    role : role || 'user'
                })
              await newlyCreatedUser.save()
              if(newlyCreatedUser){
                res.status(201).json({
                    success: true,
                    message: 'user register successfully'
                })
              }else{
                res.status(404).json({
                    success: false,
                    message: 'unable to register please try again'
                })
              }
    }
    catch(e){
        console.log(e);
        res.status(500).json({
            success: false, 
            message: 'some error occured please try again'
        })
        
    }
}

const loginUser = async(req,res)=>{
    try{
           const {username, password} = req.body;

           const user = await User.findOne({username});
           if(!user){
            res.status(400).json({
                success: false,
                message: ' user does not exits'
            })
           }  
           const isPasswordMatch = await bcrypt.compare(password, user.password)

           if(!isPasswordMatch){
            
            return  res.status(400).json({
                success: false,
                message: 'invalid username'
            })
           }
         
          const accesToken = jwt.sign({
            userId : user._id,
            username: user.username,
            role: user.role
          }, process.env.JWT_SECRET_KEY, {
            expiresIn: '15m'
          })

          res.status(200).json({
            success: true,
            message: 'Login success',
            accesToken
          })



    }
    catch(e){
        console.log(e);
        res.status(500).json({
            success: false, 
            message: 'some error occured please try again'
        })
        
    }
}

const changePassword = async(req,res)=>{
  try{
    const userId = req.userInfo.userId
    //extract old and new password
    const {oldPassword, newPaasword} = req.body;
    //find the current user logged in
    const user = await User.findById(userId)
    if(!user){
      return res.status(400).json({
        success: false,
        mesaage: 'user not found'
      })
    }

    // check if old password is coreect
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
    if(!isPasswordMatch){
      return res.status(400).json({
        success: false,
        message: 'old password is not correct please try again'
      })
    }
    //hash the new password
    const salt = await bcrypt.genSalt(10)
    const newHassedPassword = await bcrypt.hash(newPaasword,salt)

    // update the user password
    user.password = newHassedPassword
    await user.save()
    res.status(200).json({
      success:true,
      message: 'password changed successfully'
    })
  }
      catch(e){
        console.log(e);
        res.status(500).json({
            success: false, 
            message: 'some error occured please try again'
        })
        
    }
}
module.exports = {loginUser, registerUser, changePassword}