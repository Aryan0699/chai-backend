const asyncHandler=(requestHandler)=>
{
    return (req,res,next)=>  //ye teeno requestHandler se hi aa rahe
    {
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
    // Promise async fucntion ko execute karne ke liye use hota hai 
    //,then .resolve if fn executed 
    //.catch rejected if fn failed to execute
    //next((err)) pass to express error handlers
    //requestHandler fn return karta hai promise which we are handling
}

export { asyncHandler } //import bhi aise hi hoga curly brackets me


//M2 using try and catch and using Higher Order Functions
//HOF can accpet a fn as a argument and can return a fn as a variable
// res,req,next come from g\fn only
//fn hai vo asynchronous function hai to async await lagega and it takes(req,res,next) as parameter
//fn ko further ek function me pass kiya
// const asyncHandler = (fn) => {
//     return async (res,req,next) => {
//         try{
//             await fn(req,res,next);
//         }
//         catch(error)
//         {
//             res.status(error.code || 500).json({
//                 sucess:false,
//                 message:error.message
//             }) 
//             next(error)
//         }

//     }
// }

// this can be used for a middleware as well so next field included and passing the error to next middleware