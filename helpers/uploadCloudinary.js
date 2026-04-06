const streamifier = require("streamifier");
const cloudinary = require("./cloudinary");

function subirBufferACloudinary(buffer, {folder, publicId}) {
  console.log("Estoy en subirBufferCloudinary");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "image", overwrite: true },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { subirBufferACloudinary };


