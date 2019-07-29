const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) =>{
    try{
       const token = req.header('Authorization').replace('Bearer ','')
       //.replace is used to remove the 'Bearer' part from the Authorization
       
       //to check whether the token is valid
       const decoded = jwt.verify(token,'thisismycourse')
       //to find a user with the id and with the auth token valid
       const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})

       if(!user){
           throw new Error()
       }
       req.token = token
       req.user = user
       next()
    }
    catch(err){
        res.status(401).send({ error: 'please authenticate'})
    }
}
module.exports = auth