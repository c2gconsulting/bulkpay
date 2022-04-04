
import { HTTP } from 'meteor/http'

/**
 *  Country Method
 */
Meteor.methods({
  "getCountry": function (country) {
    try {
      const toLowerCase = (str = "") => str.toLocaleLowerCase();
      console.log('readFile called', country)

      const airports = EJSON.parse(Assets.getText("data/airports.json"));;

      // console.log('airports', JSON.stringify(airports))

      if (!country) return [];

      const countryAirports = [];
      for (let index = 0; index < airports.length; index++) {
        if(toLowerCase(airports[index].country) === toLowerCase(country)) {
          countryAirports.push(airports[index])
        };
      }

      console.log('countryAirports', JSON.stringify(countryAirports))
      return countryAirports;
    } catch (error) {
      console.log('readFile::error')
      console.log(error)
    }
  },
  "countryAirports": function (country) {
    try {
      const toLowerCase = (str = "") => str.toLocaleLowerCase();
      console.log('readFile called', country)

      const airports = EJSON.parse(Assets.getText("data/airports.json"));;

      // console.log('airports', JSON.stringify(airports))

      if (!country) return [];

      const countryAirports = [];
      for (let index = 0; index < airports.length; index++) {
        if(toLowerCase(airports[index].country) === toLowerCase(country)) {
          countryAirports.push(airports[index])
        };
      }

      console.log('countryAirports', JSON.stringify(countryAirports))
      return countryAirports;
    } catch (error) {
      console.log('readFile::error')
      console.log(error)
    }
  }
});
