const isAdminUser = (req,res,next)=>{
    if(req.userInfo.role !== 'admin'){
        res.status(403).json({
            success: false,
            message: 'access denied'
        })
    }
    next()
}

module.exports = isAdminUser;