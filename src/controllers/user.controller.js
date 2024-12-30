import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler( async (req, res) => {
    //get user details from frontend/ postman
    //validatuion - not empty
    //check if user already exist via usrname and email
    //check for images, check for avatar
    //upload them to cloudinary
    //create user object - create entry in DB
    //remove password and refreshToken Field from response
    //check for user respnse
    // return response


//getting data from frontend
    const {fullname, email, username, password} = req.body
    console.log("email:", email)
//validation
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
//existing user
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

//check for images

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) throw new ApiError(400, "Avatar is required")

//upload on cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) throw new ApiError(400, "Avatar is required")

//creating user object

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registiring the user")
    }


    return res.status(201).json(
        new ApiResponse(200,createdUser,"user Registered successfully")
    )

})

export {registerUser,}