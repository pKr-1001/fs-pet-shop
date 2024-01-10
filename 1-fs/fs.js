
import fs from "node:fs"; // ES6 modules
// console.log(process.argv);
// const command = process.argv[2];
// console.log("Command line argument: " , command);

// checking to see if no additional arguments passed
    if (process.argv[2] === 'read') {
        console.log("--display all pets--");
        readPets();
    } else if (process.argv[2] === 'create') {
        console.log("--create a new pet--");
        createPet(); // Usage: node fs.js create AGE KIND NAME
    }
    else if (process.argv.length < 3) {
        console.error('Usage: node pets.js [read | create | update | destroy]');
    } 
       
    



    function readPets() {
        // get data from pets.json
        fs.readFile('../pets.json', 'utf8', (error, data) => {
            if (error) {
                throw error;
            }
            const pets = JSON.parse(data);
            if (process.argv[3]) {
                // display individual pet
                // save 4th subcommand as index converted to a Number
                const index = Number(process.argv[3]);
                // check index to see if its an integer, and within the bounds of pets.length
                if (Number.isInteger(index) && index >= 0 && index < pets.length) {
                    console.log(pets[index]);
                } else {
                    // if we don't have a proper index, log correct usage and exit with code 1
                    console.error(`Usage: node pets.js read INDEX`);
                    process.exit(1);
                }
                // otherwise, print the pet at that index
            } else {
                console.log(pets);
            }
        })
    }
// Usage: node fs.js create AGE KIND NAME
    function createPet() {
        let age, kind, name;
        
        if (process.argv[3]) {
            // check if its number
            age = Number(process.argv[3]);
        }
        if (process.argv[4]) {
            kind = process.argv[4]; // already a string
        }
        if (process.argv[5]) {
            name = process.argv[5]; // already a string
        }
        const newPet = { age, kind, name};
        if(!age || !kind || !name) {
            console.error(`Usage: node pets.js create AGE KIND NAME`);
            process.exit(1);
        }
        fs.readFile('../pets.json', 'utf8', (error, data) => {
            if (error) {
                throw error;
            }
            let pets = [];
            // convert the JSON to an array
            pets = JSON.parse(data);
            // add the new pet to the array
            pets.push(newPet);
            // convert the array back to JSON
            const updatedPets = JSON.stringify(pets);

            fs.writeFile('../pets.json', updatedPets, (error) => {
                if (error) {
                    throw error;
                } else {
                    console.log(pets);
                }
        })
    })}