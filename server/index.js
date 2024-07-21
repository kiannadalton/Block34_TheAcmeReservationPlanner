const {client, 
    createTables, 
    createRestaurant, 
    createCustomer, 
    createReservation,
    destroyReservation,
    fetchCustomers, 
    fetchRestaurants,
    fetchReservations    
    } = require("./db");

const express = require('express');

// create express server
const server = express();

// middleware to use before all routes
// helpful for POST
server.use(express.json());

// should return an array of customers
server.get('/api/customers', async(req, res, next) => {
    try {
        res.send(await fetchCustomers());
    } catch (error) {
        next(error)
    }
})

// should return an array of restaurants
server.get('/api/restaurants', async(req, res, next) => {
    try {
        res.send(await fetchRestaurants());
    } catch (error) {
        next(error)
    }
})

// should return an array of reservations
server.get('/api/reservations', async(req, res, next) => {
    try {
        res.send(await fetchReservations());
    } catch (error) {
        next(error)
    }
})

// should delete a reservation
server.delete('/api/customers/:customer_id/reservations/:id', async(req, res, next) => {
    try {
        const {customer_id, id} = req.params;
        await destroyReservation({ customer_id, id});

        res.sendStatus(204);
    } catch (error) {
        next(error)
    }
})

server.post('/api/customers/:customer_id/reservations', async(req, res, next) => {
    try {
        const {customer_id} = req.params;
        const reservation = await createReservation( { ...req.body, customer_id} );
        res.status(201).send(reservation);
    } catch (error) {
        next(error)
    }
})


server.use((err, req, res) => {
    res.status(err.status || 500).send({err});
})

const init = async () => {
    console.log("connecting to database");
    await client.connect();
    console.log("connected to database");

    await createTables();
    console.log("table created");

    const [joe, kianna, ryan, mcdonalds, dairyqueen, bobevans] = await Promise.all([
        createCustomer({name: "Joe"}),
        createCustomer({name: "Kianna"}),
        createCustomer({name: "Ryan"}),

        createRestaurant({name: "McDonalds"}),
        createRestaurant({name: "DairyQueen"}),
        createRestaurant({name: "BobEvans"}),
    ]);

    console.log('tables seeded');
    console.log("Joe:", joe)
    console.log("McDonalds:", mcdonalds)

    const customers = await fetchCustomers();
    console.log('customers', customers);

    const restaurants = await fetchRestaurants();
    console.log('restaurants', restaurants);

    const [reserv1, reserv2] = await Promise.all([
        createReservation({
            date: '10/10/2024',
            party_count: 2,
            restaurant_id: mcdonalds.id,
            customer_id: joe.id
            }),
            
        createReservation({
            date: '11/12/2024',
            party_count: 5,
            restaurant_id: dairyqueen.id,
            customer_id: ryan.id
        }),
    ])

    // await destroyReservation({ id: reserv1.id, customer_id: joe.id});

    // only had one because we deleted the other with the above function
    const reserv = await fetchReservations();
    console.log('Reserv:', reserv);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, ()=>{
        console.log(`Server listening on ${PORT}`);
    });
}

init ();