const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const DBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`BD Error: ${e.message}`);
    process.exit(1);
  }
};

DBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesList = `
    SELECT movie_name 
    FROM movie 
    `;
  const movieArray = await db.all(getMoviesList);
  return response.send(movieArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { director_id, movie_name, lead_actor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
       movie (director_id, movie_name, lead_actor)
    VALUES (
         ${director_id},
        '${movie_name}',
        '${lead_actor}'
        );`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  return response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getBookQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const book = await db.get(getBookQuery);
  return response.send(book);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId = "" } = request.params;
  const movieDetails = request.body;
  const { director_id, movie_name, lead_actor } = movieDetails;
  const updateQuery = `
    UPDATE movie
    SET
        director_id = ${director_id},
        movie_name = '${movie_name}',
        lead_actor = '${lead_actor}'
    WHERE movie_id = ${movieId}`;
  await db.run(updateQuery);
  return response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM movie 
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovie);
  return response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getMoviesList = `
    SELECT * 
    FROM director 
    `;
  const movieArray = await db.all(getMoviesList);
  return response.send(movieArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesList = `
  SELECT movie_name
  FROM movie
  WHERE director_id = ${directorId};
    `;
  const movieArray = await db.all(getMoviesList);
  return response.send(movieArray);
});

module.exports = app;
