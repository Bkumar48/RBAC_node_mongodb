const {body} = require('express-validator');
module.exports = {
    registerValidator:[
        body("email")
          .trim()
          .isEmail()
          .withMessage("Please enter a valid email")
          .normalizeEmail()
          .toLowerCase(),
        body("password")
          .trim()
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
        body("password2")
          .trim()
          .custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error("Password do not match");
            }
            return true;
          }),
      ],
}