const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
       type: String,
       required: true,
       trim: true
    },
    password:{
       type: String,
       required: true,
       trim: true,
       minlength: 7,
       validate(value){
          if(value.toLowerCase().includes('password')){
              throw new Error('Password cannot contain "password"')
          }
       }
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
          if(!validator.isEmail(value)){
              throw new Error('Invalid Email')
          }
        }
    },
    age:{
       type: Number,
       default: 0,
       validate(value) {
          if(value < 0){
              throw new Error('Age should be a positive number')
          }
       }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }

},{
    timestamps: true
})

//virtual field is used to relate the both task and user
userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id: user._id.toString() },'thisismycourse')
    //console.log(token)
    
    user.tokens = user.tokens.concat({ token})
    await user.save()
    
    return token
}


// function to hide the private data when cnverting the documnt to json
userSchema.methods.toJSON = function(){
    const user = this
    //to hide the private data
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email,password) =>{
   const user = await User.findOne({email})
   if(!user){
       throw new Error('unable to login')
   }

   const isMatch = await bcrypt.compare(password,user.password)
   if(!isMatch){
       throw new Error('unable to login')
   }
   return user
}

//hash the plain text password before saving
userSchema.pre('save',async function(next){//should not use arrowfunc here as the will not bind 'this'
  const user = this
  
  if(user.isModified('password')){
      user.password = await bcrypt.hash(user.password,8)
  }
  
  next()//we use next to tell that running the code is ended
})
//delete user tasks when the user is deleted
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()

})

const User = mongoose.model('User',userSchema)

module.exports = User