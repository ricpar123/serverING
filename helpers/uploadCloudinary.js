const { v2: cloudinary } = require("cloudinary");

function uploadBuffer(buffer, {folder, publicId}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "image", overwrite: true },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

async function uploadMany(files = [], tipo, numero ) {
  
  const results = await Promise.all(
    files.map((file, index) => 
    uploadBuffer(file.buffer, {
      folder: 'ingroup/informes',
      publicId: `${tipo}_${String(index + 1 ).padStart(2, "0")}`
    })
  ));
    
  return results.map(r => ({
    url: r.secure_url, 
    public_id: r.public_id
  }));
  
}


module.exports = { uploadMany };