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

const express = require('express')

server.use(express.json())

const server = express();

// should return an array of customers
server.get('/api/customers', async(req, res, next) => {
    try {
        const response = await fetchCustomers();
        res.send(response);
    } catch (error) {
        next(error)
    }
})

// should return an array of restaurants
server.get('/api/restaurants', async(req, res, next) => {
    try {
        // same thing as getcustomers but different format:
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
        const {restaurant_id,date, party_count} = req.params;
        const reservation = await createReservation( ...req.body, restaurant_id, date, party_count )
        res.status(201).send(reservation);
    } catch (error) {
        next(error)
    }
})


server.use((err, req, res) => {
    res.status(err.status || 500).send({err});
})

const init = async () => {
    await client.connect();

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

    const customers = await fetchCustomers();

    const restaurants = await fetchRestaurants();

    const [reserv1, reserv2] = await Promise.all([
        createReservation({
            date: '10/10/2024',
            party_count: 2,
            restaurant_id: McDonalds.id,
            customer_id: joe.id
            }),
            
        createReservation({
            date: '11/12/2024',
            party_count: 5,
            restaurant_id: DairyQueen.id,
            customer_id: ryan.id
        }),
    ])

    await destroyReservation({ id: reserv1.id, customer_id: joe.id});
    const reserv = await fetchReservations();


}

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{
    console.log(`Server listening on ${PORT}`);
})

init ();