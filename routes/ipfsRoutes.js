const express = require("express") 
const router = express.Router() 
const fileUpload = require('express-fileupload')
const ipfsController = require('../controllers/ipfsController')

router.use(fileUpload({useTempFiles: true}));

router.post("/file-upload",ipfsController.ipfsUpload)
router.get('/kyc-file-upload',ipfsController.fileUploadPage)


module.exports = router;
