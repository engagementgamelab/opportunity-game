/**
 * Developed by Engagement Lab, 2018
 * ==============
 * Route to retrieve all data
 * @class api
 * @author Johnny Richardson
 *
 * ==========
 */
const keystone = global.keystone,
      mongoose = keystone.get('mongoose'),
      Bluebird = require('bluebird'),
      Location = keystone.list('Location'),
      Event = keystone.list('Event'),
      GameConfig = keystone.list('GameConfig');

mongoose.Promise = require('bluebird');

var buildData = (params, res) => {

    let locations = Location.model.find({$or: [{enabled: true}, {enabled: undefined}]}, 'name intro key categories categoriesStr description.html opportunities url image unlockedAtStart')
                    .populate('opportunities')
                    .exec();
    let events = Event.model.find({}).exec();
    let config = GameConfig.model.findOne({}).exec();

    Bluebird.props({
        locationData: locations,
        eventData: events,
        configData: config
    })
    .then(results => {
        let arrResponseLocations = [];

        results.locationData
        .forEach(
            location => {
        
                location.categories = _.omitBy(location.categories, (value, key) => {
                    return !value;
                });
                location.categoriesStr = Object.keys(location.categories).join(' ');

                arrResponseLocations.push(location);

            }
        );

        return res.status(200).json({status: 200, data: {locations: arrResponseLocations, events: results.eventData, config: results.configData}});

    }).catch(err => {
        console.log(err);
    })

}

/*
 * Get all data
 */
exports.get = function(req, res) {

    return buildData(req.params, res);

}