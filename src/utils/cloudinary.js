import {v2 as cloudinary} from "cloudinary"
//custom name
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});
//grants permission to ki kaun upload kar raha


const uploadOnCloudinary= async(localFilePath)=>
{
    try{
        if(!localFilePath) return null;

        const response=await cloudinary.uploader.upload(localFilePath,{
            //"raw" me PDFs, ZIPs, JSON, etc.
            resource_type:"auto" //imgae ki video hoga auto matlab kuch bhi chalega
        })
        //file has been uploaded successfully
        console.log("File is uploaded on Cloudinary!! ResponseUrl:",response.url)//vo url jo ki usne diya hai to use
        fs.unlink(localFilePath); 
        return response //jo field chaiye le lo 
    }
    catch(error)
    {
        //doubt sir bole ki upload hone ke baad link karo par code me upload nahi hua to unlink kar rahe
        console.error("Cloudinary Upload Error for file:", localFilePath, error);

        fs.unlink(localFilePath); //remove locally saved temp file
        return null;
    }
}

export {uploadOnCloudinary}
//file delete hona matlab vo file system se unlink ho jjati hai




