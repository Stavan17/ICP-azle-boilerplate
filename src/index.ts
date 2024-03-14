// Import necessary libraries
import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express from 'express';

// Define the structure for a vote
interface Vote {
   id: string;
   voterId: string;
   candidateId: string;
   createdAt: Date;
}

// Create a stable BTree map to store votes
const votesStorage = StableBTreeMap<string, Vote>(0);

export default Server(() => {
   const app = express();
   app.use(express.json());

   // Endpoint to cast a vote
   app.post("/votes", (req, res) => {
      try {
         // Assuming authentication and validation are performed before reaching this point
         const vote: Vote = {
            id: uuidv4(),
            createdAt: getCurrentDate(),
            ...req.body
         };
         votesStorage.insert(vote.id, vote);
         res.json(vote);
      } catch (error) {
         console.error(error);
         res.status(500).send('Error casting vote');
      }
   });

   // Endpoint to retrieve all votes
   app.get("/votes", (req, res) => {
      try {
         const votes = votesStorage.values();
         res.json(votes);
      } catch (error) {
         console.error(error);
         res.status(500).send('Error fetching votes');
      }
   });

   // Endpoint to retrieve a specific vote by its ID
   app.get("/votes/:id", (req, res) => {
      try {
         const voteId = req.params.id;
         const voteOpt = votesStorage.get(voteId);
         if ("None" in voteOpt) {
            res.status(404).send(`Vote with id=${voteId} not found`);
         } else {
            res.json(voteOpt.Some);
         }
      } catch (error) {
         console.error(error);
         res.status(500).send('Error fetching vote');
      }
   });

   // Start the server and listen for incoming requests
   return app.listen();
});

// Function to get the current date
function getCurrentDate() {
   const timestamp = new Number(ic.time());
   return new Date(timestamp.valueOf() / 1000_000);
}