const jwt = require('jsonwebtoken')

const authMiddleware = (req,res, next)=>{
      console.log('auth middleware is called');

      const authHeader = req.headers['authorization']
      console.log(authHeader);
      const token = authHeader && authHeader.split(" ")[1];
      if(!token){
        return res.status(401).json({
            success: false,
            message: " user is not authenticated"
        })
      }

      //decode the token 
      try{
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
            console.log(decodeToken);
            req.userInfo = decodeToken;
            next()
      }
          catch(e){
            
          return  res.status(500).json({
                success: false,
                message: " user is not authenticated"
            })
          }
      
}

module.exports = authMiddleware;