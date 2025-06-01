import multer from "multer"

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public")
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    // Accept images, audio, and video files
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('audio/') || 
        file.mimetype.startsWith('video/')) {
        cb(null, true)
    } else {
        cb(new Error('Invalid file type. Only images, audio, and video files are allowed.'), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
})