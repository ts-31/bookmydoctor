import multer from "multer";

const multerLib = typeof multer === "function" ? multer : (multer.default || multer);

let storage;
try {
  storage = multerLib.diskStorage({
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    },
  });
} catch (e) {
  storage = multerLib.memoryStorage ? multerLib.memoryStorage() : undefined;
}

let uploadInstance;
try {
  uploadInstance = multerLib({ storage });
} catch (e) {
  console.error("Error initializing multer instance:", e);
}

const upload = {
  single: function (fieldName) {
    return function (req, res, next) {
      if (uploadInstance && typeof uploadInstance.single === "function") {
        return uploadInstance.single(fieldName)(req, res, next);
      }
      return next();
    };
  },
  array: function (fieldName, maxCount) {
    return function (req, res, next) {
      if (uploadInstance && typeof uploadInstance.array === "function") {
        return uploadInstance.array(fieldName, maxCount)(req, res, next);
      }
      return next();
    };
  },
  fields: function (fields) {
    return function (req, res, next) {
      if (uploadInstance && typeof uploadInstance.fields === "function") {
        return uploadInstance.fields(fields)(req, res, next);
      }
      return next();
    };
  },
  none: function () {
    return function (req, res, next) {
      if (uploadInstance && typeof uploadInstance.none === "function") {
        return uploadInstance.none()(req, res, next);
      }
      return next();
    };
  },
  any: function () {
    return function (req, res, next) {
      if (uploadInstance && typeof uploadInstance.any === "function") {
        return uploadInstance.any()(req, res, next);
      }
      return next();
    };
  },
};

// Ensure default property points to self for CJS / ESM bundler compatibility
upload.default = upload;

export default upload;
export { upload };
