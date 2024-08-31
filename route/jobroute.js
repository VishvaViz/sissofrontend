// import express from "express";
// import  { isAdmin, requireSignIn } from "../middelwares/authMiddleware.js";
// import {
//     createJobController,
//     deleteJobController,
//     getAlljobsController,
//     jobStatsController,
//     updateJobController
// } from "../controllers/jobsController.js";

// const router = express.Router()

// //routes
// //CREATE JOB || POST
// router.post("/create-job",requireSignIn, isAdmin, createJobController);

// //GET JOBS || GET
// router.get("/get-job", requireSignIn, getAlljobsController);

// //UPDATE JOBS  ||  PATCH
// router.patch("/update-job/:id", requireSignIn,isAdmin ,updateJobController);

// //DELETE JOBS  || DELETE
// router.delete("/delete-job/:id", requireSignIn,isAdmin, deleteJobController);

// //JOB STATS FILTER || GET
// router.get("/job-stats", requireSignIn,isAdmin, jobStatsController);





// export default router