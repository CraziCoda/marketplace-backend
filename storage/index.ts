import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
      const suffix = file.mimetype.split('/');
      cb(null, `${file.fieldname}-${Date.now()}.${suffix[1]}`);
    },
  });

const uploads = multer({storage: storage})

  
export default uploads;