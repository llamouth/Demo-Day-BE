const express = require("express");
const restaurants = express.Router();
const { 
    getAllRestaurants, 
    getOneRestaurant, 
    addRestaurant, 
    updateRestaurantInformation,
    deleteRestaurant 
} = require('../queries/restaurants');
const { boroughsMap } = require('../utils/geoUtils')

restaurants.get("/",  async (req, res) => {
    try {
        const allRestaurants = await getAllRestaurants()
        res.status(200).json(allRestaurants);
    } catch (error) {
        res.status(500).json(error);
    }
});

restaurants.get('/:id', async (req, res) => {
    const { id } = req.params;
    const oneRestaurant = await getOneRestaurant(id);
    if (oneRestaurant) {
        res.status(200).json(oneRestaurant);
    } else {
        res.status(500).json({ error: `This id doesnt exist for a restauarant `});
    }
});

restaurants.post("/", async (req, res) => {
    const { name, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude or Longitude is missing" });
    }

    const locationCheck = boroughsMap(latitude, longitude);

    if (!locationCheck.valid) {
        return res.status(400).json({ error: locationCheck.message });
    }

    const addNewRestaurant = await addRestaurant({ name, latitude, longitude });
    res.status(201).json({
        Message: "New restaurant has been added",
        restaurant: addNewRestaurant
    });
});


restaurants.put("/:id", async (req,res)=>{
    const { lat, lng } = req.body
    const locationCheck = boroughsMap(lat, lng)

    if(!locationCheck.valid) {
        return res.status(400).json({ error: locationCheck.message })
    }

    const newInfo = req.body;
    const { id } = req.params;
    const updateRestaurantInfo = await updateRestaurantInformation({id, ...newInfo});
    if(updateRestaurantInfo.id){
        res.status(200).json({Message: "Restaurant database has been successfully updated", restaurant:updateRestaurantInfo });
    }else{
        res.status(404).json({ error: `Restaurant ID:${id} Can Not Be Found` });
    }
});

restaurants.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const deletedRestaurant = await deleteRestaurant(id);
    
    if(deletedRestaurant.id) {
        res.status(200).json({ message: `The restaurant called "${deletedRestaurant.name}" has been removed.` });
    } else {
        res.status(404).json( {error: `Restaurant ID:${id} Can Not Be Found`});
    }
});

module.exports = restaurants;