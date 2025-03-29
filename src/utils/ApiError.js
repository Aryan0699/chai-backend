class ApiError extends Error
{
    //apna contructor bana rahe overwrite
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack="" //error ka stack
    )
    {
        super(message) //parent constructor message leta hoga as parameter
        //this.var var set karne ke liye parent constructor ko super method ke through bulana hi padta hai
        //super se u can acccess methods of parent class

        this.statusCode=statusCode //dono me hai to overwrite ho jayega
        this.data=null; //read about this
        this.message=message//ig need nahi hai --yess correct
        this.success=false;
        this.errors=errors

        if(stack) //yaha inn files me dikkat hai
        {
            this.stack=stack;
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}

//Error aayega to iss format and aayega aur jayega
export {ApiError}

//iska object banake use karna hoga