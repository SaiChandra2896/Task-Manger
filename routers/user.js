const sharp = require('sharp')
const multer = require('multer')
const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const User = require('../models/user')

router.post('/users',async (req,res) =>{
    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }
    catch(err){
      res.status(400).send(err)
    }
})

router.post('/users/login', async (req,res) =>{
    try{
       const user = await User.findByCredentials(req.body.email,req.body.password)
       const token = await user.generateAuthToken()
       res.send({user,token})
    }
    catch(err){
      res.status(400).send()
    }
})

router.post('/users/logout',auth,async(req,res) =>{
    try{
       req.user.tokens = req.user.tokens.filter((token) =>{
          return token.token !== req.token
       })
       await req.user.save()
       res.send()
    }
    catch(err){
       res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async(req,res) =>{
    try{
      req.user.tokens = []
      await req.user.save()
      res.send()
    }
    catch(err){
      res.status(500).send()
    }
})

//auth is a middleware function which triggers when the users makes a req to this route
router.get('/users/me', auth ,async (req,res) =>{
    res.send(req.user)
})

router.patch('/users/me',auth,async(req,res) =>{
    //return error if user updates prprties which does not exist
    const updates = Object.keys(req.body)//convert req.params object into array of its properties
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update) =>{
      return allowedUpdates.includes(update)
    })
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates'})
    }

   const _id = req.user._id
    
    try{
         
        updates.forEach((update) =>{
            //brcket syntax is used to dynamically get updates from the client
            req.user[update] = req.body[update]
        })

        await req.user.save()

      //const user = await User.findByIdAndUpdate(_id,req.body,{new: true, runValidators: true})
      res.send(req.user)
    }
    catch(err){
      res.status(400).send(err)
    }
})

//remove own user profile
router.delete('/users/me',auth,async(req,res) =>{
    const _id = req.user._id
    try{ 
    await req.user.remove()
     res.send(req.user)
    }
    catch(err){
        res.status(500).send()
    }
})

const upload = multer({
  limits:{
    fileSize:1000000
  },
  fileFilter(req,file,cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error('please upload an image'))
    }
    cb(undefined,true)
  }
})

router.post('/users/me/avatar',auth ,upload.single('avatar'),async(req,res) =>{
 const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
 
  req.user.avatar =  buffer
 await req.user.save()
  res.send('Image uploaded')
},(err,req,res,next) =>{
  res.status(400).send({error: err.message})
})

router.delete('/users/me/avatar',auth,async(req,res) =>{
  try{
    req.user.avatar = undefined
    await req.user.save()
    res.send('image deleted')
  }
  catch(err){
    res.status(500).send()
  }
  
})

router.get('/users/:id/avatar',async(req,res) =>{
  try{
    const user = await User.findById(req.params.id)
    
    if(!user || !user.avatar){
      throw new Error()
    }

    res.set('Content-Type','image/png')
    res.send(user.avatar)
  }
  catch(err){
    res.status(404).send()
  }
})

module.exports = router