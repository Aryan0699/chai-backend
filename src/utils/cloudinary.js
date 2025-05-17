import dotenv from "dotenv"; ///ye import nahi kiya tha to env variables nahi aa rahe the almost satrt hote hi run kar rahi isliye might be index se accsess na mil raha ho  **par kyu instanly run ho rhai DOUBT**
dotenv.config();
import {v2 as cloudinary} from "cloudinary"
//custom name
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});
//checker if loading or not
console.log("Cloudinary Config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "Exists" : "Missing",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "Exists" : "Missing"
});
//grants permission to ki kaun upload kar raha


const uploadOnCloudinary= async(localFilePath)=>
{
    console.log("Local File Path:",localFilePath)
    try{
        if(!localFilePath) return null;

        const response=await cloudinary.uploader.upload(localFilePath,{
            //"raw" me PDFs, ZIPs, JSON, etc.
            resource_type:"auto" //imgae ki video hoga auto matlab kuch bhi chalega
        })
        //file has been uploaded successfully
        // console.log(response)
        console.log("File is uploaded on Cloudinary!! ResponseUrl:",response.url)//vo url jo ki usne diya hai to use
        fs.unlinkSync(localFilePath); 
        return response //jo field chaiye le lo 
    }   
    catch(error)
    {
        //doubt sir bole ki upload hone ke baad link karo par code me upload nahi hua to unlink kar rahe
        console.error("Cloudinary Upload Error for file:", localFilePath, error);

        fs.unlinkSync(localFilePath); //remove locally saved temp file
        return null;
    }
}

export {uploadOnCloudinary}
//file delete hona matlab vo file system se unlink ho jjati hai




