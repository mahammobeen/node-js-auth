const Image = require('../models/image')
const cloudinary = require('../config/cloudinary')
const {uploadtToCloudinary}= require('../helpers/cloudinaryHelper')
const fs = require('fs')
const uploadImage = async(req,res)=>{
    try{
             if(!req.file){
                return res.status(400).json({
                    success: false,
                    message: 'file is required Please upload image'
                })
             }

             const {url, publicId} = await uploadtToCloudinary(req.file.path)
             const newlyUploadedImage = new Image({
                url,
                publicId,
                uploadedBy: req.userInfo.userId
             })

             await newlyUploadedImage.save()
         
             fs.unlinkSync(req.file.path)

             res.status(201).json({
                success: true, 
                message: 'Image uploaded successfully',
                image: newlyUploadedImage
             })
    }
    catch(e){
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'something went wrong please try again'
        })
        
    }
}

const fetchImagesController  = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page -1 ) * limit

        const sortBy = req.query.sprtBy || 'createdAt'
        const sortOrder = req.query.sortOrder === 'async' ? 1: -1
        const totalImages = await Image.countDocuments()
        const totalPages = Math.ceil(totalImages/ limit)

        const sortObj = {}
        sortObj[sortBy] = sortOrder
          const images = await Image.find().sort(sortObj).skip(skip).limit(limit)

          if(images){
            res.status(200).json({
                success: true,
                currentPage: page,
                totalPages: totalPages,
                totalImages: totalImages,
                data: images 
                
            })
          }
    }
    catch(e){
          console.log(e);
        res.status(500).json({
            success: false,
            message: 'something went wrong please try again'
        })
    }
}

const deleteImage = async(req,res)=>{
try{
       const getCurrentImage = req.params.id
       const userId = req.userInfo.userId
       const image = await Image.findById(getCurrentImage)
       if(!image){
        return res.status(400).json({
            success: false,
            message: 'image not found'
        })
       }
       //check if image is uploaded by the same user or not
       if(image.uploadedBy.toString() !== userId){
        return res.status(403).json({
            success: false, 
            message: 'invalid user'
        })
       }
       // delete the image from cloudinary storage
       await cloudinary.uploader.destroy(image.publicId)
       
       //delete the image from mongodb database
       await Image.findByIdAndDelete(getCurrentImage)
       res.statud(200).json({
        success: true,
        message: 'image deleted successfully'
       })
}
   catch(e){
          console.log(e);
        res.status(500).json({
            success: false,
            message: 'something went wrong please try again'
        })
}
}
module.exports = {
    uploadImage,
    fetchImagesController,
    deleteImage
}

