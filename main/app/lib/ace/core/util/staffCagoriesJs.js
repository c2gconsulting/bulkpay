Core.StaffCategories = [
    "Executive Management",
    "Senior Manager",
    "Manager",
    "Coordinator",
    "Supervisor",
    "Officer",
    "Technicians/ Others",
    "Client"
]


const anEntityKey = "POSITION (AS CONTAINED IN SAP S4HANA)";
const aCategoryKey = "CORRESPONDING STAFF CATEGORY";

/**
 * @example 
 *  entityJSON.Sheet1.forEach((eachEntityJSON) => {
       const nameKey = eachEntityJSON[anEntityKey].toLowerCase();
       const name = eachEntityJSON[anEntityKey];
       const staffCategory = eachEntityJSON[aCategoryKey];
       hashMap[nameKey] = { ...eachEntityJSON, positionDesc: name, name, staffCategory }
    })
 * @param {*} entityJSON 
 * @returns {Object} Object
 */
Core.getPositionCategories = (entityJSON) => {
    const hashMap = {}
    entityJSON.Sheet1.forEach((eachEntityJSON) => {
      console.log('anEntityKey', anEntityKey)
      console.log('eachEntityJSON', eachEntityJSON)
      console.log('eachEntityJSON[anEntityKey]', eachEntityJSON[anEntityKey])
      const nameKey = (eachEntityJSON[anEntityKey] || "").toLowerCase();
      const name = (eachEntityJSON[anEntityKey] || "");
      const staffCategory = eachEntityJSON[aCategoryKey];
      hashMap[nameKey] = { ...eachEntityJSON, positionDesc: name, name, staffCategory }
    })
    return hashMap;
}

/**
 * 
 * @example 
 * let currentPosition = '';
    Object.keys(hashMap).map(hMapKey => {
        const hMap = hashMap[hMapKey];
        const nameKey = hMap.name.toLowerCase();
        if (nameKey.includes(position_description)) {
          // FOR Quick identification during next iterations
          hashMap[position_description] = hMap;
          currentPosition = hMap;
        }
    })
 * @param {*} positionsCategory 
 * @param {*} position_description 
 * @returns {String} String
 */
Core.getPositonCategory = (positionsCategory, position_description) => {
    let currentPosition = '';
    Object.keys(positionsCategory).map(positionCategoryKey => {
        const positionCategory = positionsCategory[positionCategoryKey];
        const nameKey = positionCategory.name.toLowerCase();
        if (nameKey.includes(position_description) || position_description.includes(nameKey)) {
          // FOR Quick identification during next iterations
          positionsCategory[position_description] = positionCategory;
          currentPosition = positionCategory;
        }
    })

    return currentPosition
}
