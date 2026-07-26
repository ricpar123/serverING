const cloudinary = require('cloudinary').v2;


cloudinary.config({ 
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});





async function subirACloudinary(base64Data) {
   try {
      const res = await cloudinary.uploader.upload(base64Data, {
         folder: "Ingroup_fotos",
         resource_type: "image"
      });
      return res.secure_url;

   } catch (error) {
      console.error("Error subiendo imagen");
      throw error;
   }
} 

module.exports = { subirACloudinary };