const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: "muscle_cars_db_user",
  host: "dpg-cvi2kclsvqrc73cjjnmg-a.oregon-postgres.render.com",
  database: "muscle_cars_db",
  password: "3XhaLGrw321gv58E5IIAzSFVwAoKpYRr",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

/*
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "muscle_cars_db",
  password: "120704",
  port: 5432,
});
*/

app.get("/api/v1/muscle-cars", async (req, res) => {
  const { make, year } = req.query;
  let query = "SELECT * FROM muscle_cars WHERE 1=1";
  const values = [];

  if (make) {
    values.push(make);
    query += ` AND make = $${values.length}`;
  }
  if (year) {
    values.push(year);
    query += ` AND year = $${values.length}`;
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ message: "Failed to retrieve cars" });
  }
});

app.post("/api/v1/muscle-cars", async (req, res) => {
  const { make, model, horsepower, year } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO muscle_cars (make, model, horsepower, year) VALUES ($1, $2, $3, $4) RETURNING *",
      [make, model, horsepower, year]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ message: "Failed to add car" });
  }
});

app.put("/api/v1/muscle-cars/:id", async (req, res) => {
  const { id } = req.params;
  const { make, model, horsepower, year } = req.body;
  try {
    const result = await pool.query(
      "UPDATE muscle_cars SET make = $1, model = $2, horsepower = $3, year = $4 WHERE id = $5 RETURNING *",
      [make, model, horsepower, year, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ message: "Failed to update car" });
  }
});

app.get("/", (req, res) => {
  res.send("Muscle Cars API is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});