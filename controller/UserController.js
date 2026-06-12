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

export const updateProfile = async(req,res)=>{
    try{
       const userId= req.userId
       const {name, email} = req.body;
       if(!name || !email)
       {
        return res.status(400).json({message : "Name and Email are required"})
       }
       const updateUser= await Model.findByIdAndUpdate(
        userId,
        {
            name,
            email,
        },
        {
            new : true,
        }
       );
     if(updateUser)
      return res.status(200).json({
      message: "Profile updated successfully",
      uservalue: {
        name,
        email,
      },
    });
  } catch (error) {
    console.error(error);
  }
}