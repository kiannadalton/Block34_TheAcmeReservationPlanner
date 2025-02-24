const pg = require('pg');
const uuid = require('uuid');

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_reservation_planner');


// create tables in db.js
// UUID INSTEAD OF SERIAL
const createTables = async () => {
    const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS restaurants;
    DROP TABLE IF EXISTS customers;

    CREATE TABLE customers(
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
    );
    CREATE TABLE restaurants(
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
    );
    CREATE TABLE reservations(
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    party_count INTEGER NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL
    );
`
await client.query(SQL);
}

// keep name destructured since it will pull from a body of data
const createRestaurant = async ({name}) => {
    const SQL = `
    INSERT INTO restaurants(id, name) VALUES ($1, $2) RETURNING *;
    `
    // will be response in README / Canvas
    const dbResponse = await client.query(SQL, [uuid.v4(), name]);
    return dbResponse.rows[0];
}

const createCustomer = async ({name}) => {
    const SQL = `
    INSERT INTO customers(id, name) VALUES ($1, $2) RETURNING *;
    `
    // will be response in README / Canvas
    // v4 for uuid
    const dbResponse = await client.query(SQL, [uuid.v4(), name]);
    return dbResponse.rows[0];
}

// add [0] after row since we are only creating 1 thing
const createReservation = async({date, party_count, restaurant_id, customer_id}) => {
    const SQL = `
    INSERT INTO reservations (id, date, party_count, restaurant_id, customer_id) VALUES($1, $2, $3, $4, $5) RETURNING *;
    `;
    const dbResponse = await client.query(SQL, [
        uuid.v4(),
        date,
        party_count, 
        restaurant_id, 
        customer_id
    ]);
    return dbResponse.rows[0];
};

const destroyReservation = async ({id, customer_id}) => {
    const SQL = `
        DELETE FROM reservations WHERE id=$1 AND customer_id=$2
    `;
    // don't need to return
    await client.query(SQL, [
        id,
        customer_id,
    ]);
}

// don't include [0] after rows or else only first item in array will show up
const fetchCustomers = async() => {
    const SQL = `
        SELECT * FROM customers;
    `;
    const dbResponse = await client.query(SQL);
    return dbResponse.rows;
}

const fetchRestaurants = async() => {
    const SQL = `
    SELECT * FROM restaurants;
`;
const dbResponse = await client.query(SQL);
return dbResponse.rows;
}

const fetchReservations = async() => {
    const SQL = `
    SELECT * FROM reservations;
`
const dbResponse = await client.query(SQL);
return dbResponse.rows;
}

module.exports = {
    client, 
    createTables,
    createRestaurant,
    createCustomer,
    createReservation,
    destroyReservation,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations,
}