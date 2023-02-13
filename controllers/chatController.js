const multer = require("multer");
const Chat = require("../models/chatModel");


// Multer upload images and access in local folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// Upload single file through multer at the same time
const upload = multer({ storage: storage }).single("file");

// Multer upload route
exports.multerRoute = async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.json({ sucess: false, err });
    }
    return res.json({ sucess: true, url: 'res.req '});
  });
};


// Get chat data route
exports.getChat = async (req, res) => {

  Chat.find({transaction:req.params.transactionId}).exec((err, chats) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(chats);
  });
};
