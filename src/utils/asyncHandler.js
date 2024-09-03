const asyncHandler=(requestHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler}




// const asyncHandler = (fn)=>(req,res,next)=>{
//          try {
            
//          } catch (error) {
//             res.status(err.code || 500).json({
//                 success:false,
//                 message:err.message
             
//             })
            
//          }
// }

// The asyncHandler function wraps asynchronous route handlers 
// to automatically catch and forward errors to the Express error-handling middleware.
//  This helps avoid repetitive try-catch blocks in each route handler and makes the code
//   cleaner and more maintainable.

//to handle this async data