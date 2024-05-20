const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();
const users = [];
const exercises = [];
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36);
};

const createLogObj = (user, exercises, from, to, limit) => {
  let filteredExercises = exercises.filter(
    (exercises) => exercises._id === user._id
  );

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    filteredExercises = exercises.filter((item) => {
      // const itemDate = new Date(item.date);
      return item.date >= fromDate && item.date <= toDate;
    });
  } else if (from) {
    const fromDate = new Date(from);
    filteredExercises = exercises.filter(
      (item) => new Date(item.date) >= fromDate
    );
  } else if (to) {
    const toDate = new Date(to);
    filteredExercises = exercises.filter(
      (item) => new Date(item.date) <= toDate
    );
  }
  if (limit) {
    console.log(limit)
    filteredExercises.slice(0, +limit);
  }

  const logObj = {
    username: user.username,
    count: filteredExercises.length,
    _id: user._id,
    log: filteredExercises.map((exercises) => {
      return {
        description: exercises.description,
        duration: exercises.duration,
        date: exercises.date.toDateString(),
      };
    }),
  };

  return logObj;
};
app.post("/api/users", (req, res) => {
  const id = generateUniqueId();
  const user = {
    _id: id,
    username: req.body.username,
  };
  users.push(user);
  res.json(user);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id;
  const user = users.find((user) => user._id === id);
  const exercise = {
    _id: id,
    username: user.username,
    description: req.body.description,
    date: req.body.date
      ? new Date(req.body.date)
      : new Date(),
    duration: +req.body.duration,
  };
  exercises.push(exercise);
  res.json({...exercise, date: exercise.date.toDateString()});
});

app.get("/api/users/:_id/exercises", (req, res) => {
  res.json({...exercises,date: exercises.date.toDateString()});
});

app.get("/api/users/:_id/logs", (req, res) => {
  const user = users.find((user) => user._id === req.params._id);
  const logs = createLogObj(
    user,
    exercises,
    req.query.from,
    req.query.to,
    req.query.limit
    );
    console.log("query",req.query, "exercises" ,exercises, "logs", logs)
  res.json(logs);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

