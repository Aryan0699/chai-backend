import mongoose, { mongo, Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

//no need for id as mongodb gerneate  karta hia jab user create hoga tab     
const userSchema = new Schema(
    {
        username:
        {
            type: String,
            required: true,
            unique: true,//mongodb auto creates index
            lowercase: true,
            trim: true,
            index: true //No need if unique //improves performance and makes it more searchable 

        },

        email:
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName:
        {
            type: String,
            required: true,
            trim: true,
            index: true //NOte this 

        },
        avatar:
        {
            type: String, //cloudninary url video upload karke url de deta hai
            required: true,
        },
        coverImage:
        {
            type: String, //cloudninary url video upload karke url de deta hai
        },
        //isme ham jo video dekh liye uska id store karenge
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        //String kyu password encrypt karna padega kuch aur password me add karke store karo par comparision me dikkat aayegai so baadme dekhte hai
        password:
        {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken:
        {
            type: String //long string hoti hai
        }

    },
    {
        timestamps: true
    }
)

// user jab bhi save ho uske pehele uske password ko hash karna padega 
// userSchema.pre("save",()=>{}) //tujhe upar userSchema ka password feild access karna hai to this.password karega but arrow fucntion me this ka referce jo ki userschema hai vo nahi milta
//password banane me time lagta hai so use async and await
//all four as parameter available but require only next
//isModified yaha hi mliega ye upadate bi handle kar lega therefore more usefull varna moddification ka code alag se lokhna padta
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    console.log("Changed password",this.password)
    this.password = await bcrypt.hash(this.password, 10)
    //If you don't use await, this.password will be assigned a Promise object instead of the actual hashed password.
    //equivalent to salt auto generated in above one
    //10-salt rounds
    //const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

//     Use await when calling an async function that returns a Promise
// ✅ Without await, the function will return a Promise instead of the actual value
//no need to return as next() used
    next();
})

//password checking ke liye
userSchema.methods.isPasswordCorrect = async function(password){
    //true ya false
    return await bcrypt.compare(password, this.password)
}

//userSchema pe work karne wale sare methods me mera custom ek aur add karlo
//sign method to create token
//Payload  Stores user-related data (like userId, email, role) Predefined claims with special meanings. like expirationtime issued at
userSchema.methods.generateAccessToken = function () //likh sakte ho access token
{
    //ye bhi header.payload.signature hai isme alag nahi hai
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
//both jwt token hi hai
//DETTO SAME bas yaha thode kam fields since bar bar refresh hoga

// Server generates Access Token (short expiry) and Refresh Token (long expiry).

// Access Token is sent to the client (stored in memory/local storage).

// Refresh Token is stored securely (HTTP-only cookie or database).


// IF Access Token Expires -> Client sends a request to the /refresh endpoint with the Refresh Token.  server has to store it securely and send it automatically when needed.

// Server verifies Refresh Token and issues a new Access Token.

// User stays logged in without re-entering credentials.
userSchema.methods.generateRefreshToken = function ()
{
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    ) 
}


export const User = mongoose.model("User", userSchema);