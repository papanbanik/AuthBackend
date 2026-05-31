import Model from '../model/userModel.js'

export const getUserData= async(req,res)=>{
    try{
       const userId = req.userId;
        const user= await Model.findById(userId)
        if(!user)
        {
            return res.json({success : false,  message:'user not found'})
        }
        res.json({
            success: true,
            uservalue: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
                      }

        })
    }
    catch(error){
    return res.status(500).json({
    success: false,
    message: error.message
  });
    }
}