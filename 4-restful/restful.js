import express, { text } from 'express';
import fs from 'fs';
import pg from 'pg'; // const { pool } = require('pg')

const fsPromise = fs.promises;

const pool = new pg.Pool({
    host: 'localhost',
    port: 6432,
    user: 'postgres',
    password: 'postgres',
    database: 'pets_dev'
})

pool.connect()
    .then((pool) => {
        console.log("Connected to postgres using Pool - ", pool)
    })
    .catch((err) => {
        console.log("Couldn't connect to postgres")
    })

const PORT = 8001;

const app = express();
// middleware to accept json as request body
app.use(express.json());

app.get('/pets', (req, res, next) => {
    pool.query(`SELECT * FROM pets`)
    .then((data) => {
        console.log("All pets: \n", data.rows);
        res.json(data.rows)
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    })
    // fsPromise.readFile('../pets.json', 'utf-8')
    //     .then((text) => {
    //         res.json(JSON.parse(text));
    //     })
    //     .catch((err) => {
    //         next(err)
    //     })
})

app.use((req, res, next) => {
    const authToken = req.headers.authorization;
    console.log("authToken: ", authToken);
    if (authToken === "abc") {
        req.isAuthenticated = true;
        next();
    } else {
        req.isAuthenticated = false;
        const err = new Error("Access denied, ")
        err.status = 401;
        next(err);
    }
})


// get a single pet
app.get("/pets/:index", (req, res, next) => {
    // if (!req.isAuthenticated){
    //     const err = new Error("Access denied, get out");
    //     err.status = 401;
    //     next(err);
    // }
    const petId = Number.parseInt(req.params.index);
    console.log("Using pet id: ", petId);
    pool.query(`SELECT name, kind, age FROM pets WHERE id = $1`, [petId])
    .then((data) => {
        if (data.rows.length == 0) {
            res.sendStatus(404);
            return;
        }
        console.log(data.rows[0]);
        res.json(data.rows[0])
        // assume we got a row of data
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
        // next(err);
    })
    // res.send(`You wanted pet index ${index}`);
    // fsPromise.readFile("../pets.json", 'utf-8')
    //     .then((text) => {
    //         const pet = JSON.parse(text);
    //         if (!Number.isInteger(index) || index < 0 || index >= pet.length) {
    //             // index bad
    //             res.sendStatus(404);
    //             return;
    //         }
    //         res.json(pet[index]);
    //     })
    //     .catch((err) => { // .catch(next)
    //         next(err);
    //     })
})


app.post("/pets", (req, res, next) => {
    // const age = req.body.name;
    const age = Number(req.body.age);
    const name = req.body.name;     // const {name, kind} = req.body;
    const kind = req.body.kind;
    console.log(`${name}, Age: ${age}, Kind: ${kind}`)

    if (!name || !kind || Number.isNaN(age)) {
        res.sendStatus(400);
        return;
    }
    // TODO make sure name, kind, and age exist, and age is a number
    console.log(`Creating pet with - Name: ${name}, Age: ${age}, Kind: ${kind}`)
    // const pet = {name, age, kind};
    pool.query(`INSERT INTO pets (name, kind, age) VALUES ($1, $2, $3) RETURNING *`, [name, kind, age])
        .then((data) => {
            console.log(data.rows[0])
            const newPet = data.rows[0]
            delete newPet.id; // const { id, ...newPet } = data.row[0];
            res.json(newPet)
        })
        .catch((err) => {
            console.error(err)
            res.sendStatus(500);
            // next(err);
        })
    
    // TODO - alter pets.json to add the new pet
    // fsPromise.readFile('../pets.json', 'utf-8')
    //     .then((text) => { // read oets
    //         const pets = JSON.parse(text);
    //         pets.push(pet);
    //         return pets;
    //     })
    //     .then((pets) => { // write the pets
    //         return fsPromise.writeFile('../pets.json', JSON.stringify(pets))
    //     }).then((pets) => {
    //         console.log("Added new pet to pets.json");
    //         res.json(pet);
    //     })
    //     .catch((err) => {
    //         next(err);
    // })
})

app.patch("/pets/:petId", function(req, res, next) {
    const id = Number.parseInt(req.params.petId);
    const { name, kind } = req.body;
    const age = (req.body.age !== undefined) ? Number(req.body.age) : null;
    // const age = Number(req.body.age);
    
    console.log("index: ", id);
    console.log("name: ", name);
    console.log("kind: ", kind);
    console.log("age from request: ", req.body.age);
    console.log("age: ", age);
    if (id.isNaN) {
        res.sendStatus(400)
        return;
    }
    pool.query(
        `UPDATE pets SET 
            name = COALESCE($1, name),
            kind = COALESCE($2, kind),
            age = COALESCE($3, age)
        WHERE id = $4 RETURNING *`, 
        [name, kind, age, id])
        .then((data) => {
            if(data.rows.length == 0) {
                res.sendStatus(404);
                return;
            }
            // pet updated OK - send to client
            console.log("Pet updated: \n", data.rows[0]);
            res.json(data.rows[0])
        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(500);
            // next(err);
        })

    // let pet = {};
    // // We have a integer index, and string name
    // fsPromise.readFile("../pets.json", 'utf-8')
    //     .then((text) => {
    //         const pets = JSON.parse(text); // changes into javascript object
    //         if (index < 0 || index >= pets.length - 1) {
    //             res.sendStatus(404);
    //             return;
    //         }
    //         console.log(`Changing pet at index ${index} to name ${name}`);
    //         pets[index].name = name;
    //         pet = pets[index];
    //         return fsPromise.writeFile("../pets.json", JSON.stringify(pets))
    //     })
    //     .then((pets) => {
    //         console.log("Updates pet name to: ", name);
    //         res.json(pet);
    //     })
    //     .catch((err) => {
    //         // next(err);
    //         console.error(err);
    //         res.sendStatus(500);
    //     })
})

app.delete("/pets/:index", (res, req, next) => {
    const id = Number.parseInt(req.params.index);
    console.log("Using id: ", id);

    if (Number.isNaN(id)) {
        res.sendStatus(400);
        return;
    }
    console.log("deleting pet with id ", id)

    pool.query(`DELETE FROM pets WHERE id = $1 RETURNING *`, [id])
    .then((data) => {
        if (data.rows.length === 0) {
            console.log("no pet found with that id");
            res.sendStatus(404);
        } else {
            console.log("deleted pet: \n", data.rows[0]);
            res.send(data.rows[0])
        }
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
        // next(err);
    })

})


// internal server error catching middleware
app.use((err, req, res, next) => {
    console.error(err);
    console.log(err.error)
    res.sendStatus(err.status);
    return;
});

// middleware to catch unknown routes
app.use((_, res) => {
    res.sendStatus(404);
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})
