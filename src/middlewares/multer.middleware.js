import multer from "multer";


//multer ke through  file store karenge apne local server per disk storage me
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //error maine null kar diya ki aay to kuch mat karna
        //sari files yaha store hongi
        cb(null, './public/temp');
    },

    filename: function (req, file, cb) {
        //same name as user
        //if user ne same name ki de di to
        //**TODO - kaise unique filename rakhna hai */
        cb(null, file.originalname) //can lead to overwriting
    }
})
//upload is a instance of multer iwth defined storage capacities
export const upload = multer({ 
    // storage: storage //jab both same write once
    storage
})

//storage filename return kar dega 
//path ./public/temp/filename


