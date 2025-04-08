const express = require('express');
const userApp = express.Router();
const { createUserOrAuthor,userOrAuthorLogin } = require('./Util');  // Destructure from module.exports

userApp.post('/user', createUserOrAuthor);

userApp.post('/login',userOrAuthorLogin);

module.exports = userApp;
