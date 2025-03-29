class ApiResponse
{
    constructor(statusCode,data,message="Success")
    {
        this.statusCode=statusCode;
        this.data=data;
        this.message=message;
        this.success=statusCode < 400 //400 se niche sucessful uske upar error se bhejenge general practice 
    }
}

export default ApiResponse