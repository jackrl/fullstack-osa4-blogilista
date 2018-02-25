const mongoose = require('mongoose')

let userScheam = new mongoose.Schema({
  username: String,
  name: String,
  adult: Boolean,
  passwordHash: String,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userScheam.statics.format = function(user) {
  return {
    username: user.username,
    name: user.name,
    adult: user.adult,
    passwordHash: user.passwordHash,
    blogs: user.blogs,
    id: user._id
  }
}

const User = mongoose.model('User', userScheam)

module.exports = User