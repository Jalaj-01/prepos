const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {

        let folder = 'upsc-prepos/questions';

        if (file.mimetype.startsWith('image')) {
            folder = 'upsc-prepos/question-images';
        }

        return {
            folder,
            resource_type: 'auto',
            allowed_formats: [
                'jpg',
                'jpeg',
                'png',
                'webp'
            ]
        };
    }
});

const upload = multer({
    storage
});

module.exports = upload;