import { MongoServerError } from "mongodb";
import { createUser, getUsers } from "../db/User";
import express from "express";

export const getAllUsers = async (req: express.Request,res: express.Response) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({error:"Internal server error", massage:"Internal server error"});
  }
};

export const createNewUser = async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const user = req.body
    
    // Validate required fields
    // IMPORTANTE LLAMAR a requestTransfer
    if (!user.userId || !user.destinationBlockchain || !user.investToken || !user.purchasedTokens) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }  
    console.log('ok - all data');

    // Create the bond using the createBond method
    const newUser = await createUser(user)
    // .catch((error: MongoServerError) => {
    //   if (error.code === 11000) {
    //     res.status(400).json({
    //       error: "User already exists",
    //       message: "User already exists.",
    //     });
    //     return;
    //   }
    // });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "User creation failed",
      message: "An unexpected error occurred while creating the bond.",
    });
  }
};