const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api',{ 
    useNewUrlParser:true,
    useCreateIndex: true,
    useFindAndModify: false
})



// const me = new User({
//    name: 'meghana',
//    email: 'meghna@gmail.com  ',
//    password: 'meghna123'
// })
// me.save().then((me) =>{
//     console.log(me)
// }).catch((err) =>{
//     console.log(err)
// })


// const task1 = new Task({
//     description: 'Clean the housr',
//    // completed: false
// })

// task1.save().then((task1) =>{
//     console.log(task1)
// }).catch((err) =>{
//     console.log('Error!!',err)
// })

