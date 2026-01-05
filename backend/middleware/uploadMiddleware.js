const multer = require('multer');
const path = require('path');

// 1. Storage settings
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Importance: 'uploads' folder must exist
    },
    filename(req, file, cb) {
        // Unique filename: fieldname-timestamp-extension
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// 2. File Filter (Images only)
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}

// 3. Create upload variable
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;