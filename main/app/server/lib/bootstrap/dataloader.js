/*
 * DataLoader is a global server object that it can be reused for different collections.
 * It assumes collection data in /private/data
 */

/* eslint no-loop-func: 0*/
let isSent = false;

const EmployeesPositions = (eachLine, otype, updatedObject) => {
  let name = updatedObject ? updatedObject["POSITION (AS CONTAINED IN SAP S4HANA)"] : eachLine.name;
  let correspondingStaffCategory = updatedObject ? updatedObject["CORRESPONDING STAFF CATEGORY"] : "";

  return {
    name: name || eachLine.positionDesc || "",
    // parentId: "",
    status: "Active",
    otype: otype || "Position",
    correspondingStaffCategory,
      // allowedValues: ["Unit", "Position", "Job", "Location"]
    businessId: "FYTbXLB9whRc4Lkh4", // FYTbXLB9whRc4Lkh4 - dev - FJe5hXSxCHvR2FBjJ
    createdBy: 'woW5qkSL6vsma7Nan', // woW5qkSL6vsma7Nan - dev - ZAs6m3LLyZpS2p5K6
    lastEditedBy: 'woW5qkSL6vsma7Nan', // woW5qkSL6vsma7Nan - dev - ZAs6m3LLyZpS2p5K6
    properties: {
      code: eachLine.positionId,
      correspondingStaffCategory
    },
    // "successFactors": {},
    _groupId: eachLine.group || eachLine._group || "gqEreTKe3h43z3q2R" // gqEreTKe3h43z3q2R - dev - QyPY7RY4Hc2dqZTem
  }
}

const RestructureWBS = (wbs, projectId, businessId) => ({
  ...wbs,
  code: wbs.wbs_number,
  unitOrProjectId: projectId || wbs.unitOrProjectId,
  fullcode: wbs.object_number,
  manager: wbs.wbs_manager,
  managerId: wbs.wbs_manager_number,
  externalCode: wbs.external_wbs_number,
  type: 'project',
  businessId: "TRbx9J5uBpgQ6igps", // TRbx9J5uBpgQ6igps - dev - FJe5hXSxCHvR2FBjJ
})

const RestructureProject = (eachLine, businessId) => ({
  ...eachLine,
  businessId: businessId || "TRbx9J5uBpgQ6igps", // TRbx9J5uBpgQ6igps - dev - FJe5hXSxCHvR2FBjJ
  name: eachLine.description,
  // activities: (eachLine.wbs && eachLine.wbs.lines.map(wbs => RestructureWBS(wbs))) || []
})

DataLoader = class DataLoader {
  /**
   * BootstrapLoader.loadData
   * @summary imports collection initialisation data
   * @param {Object} collection - The collection to import
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadData(collection, jsonFile) {
    check(collection, Mongo.Collection);
    check(jsonFile, Match.Optional(String));

    // prevent import if existing collection data
    if (collection.find().count() > 0) {
      return false;
    }

    let json = null;
    let result = null;

    Core.Log.debug(
      `Loading initialisation data for ${collection._name}`);
    // if jsonFile was path wasn't provided
    // we'll assume we're loading collection data
    if (!jsonFile) {
      json = EJSON.parse(Assets.getText("data/" + collection._name +
        ".json"));
    } else {
      json = EJSON.parse(jsonFile);
    }

    // loop over each item in json and insert into collection
    for (let item of json) {
      try {
        result = collection.insert(item);
      } catch (err) {
        Core.Log.error("Error adding initialisation data to " +
          collection._name + ":", err.message);
      }
    }

    if (result) {
      Core.Log.info(
        `Success importing initialisation data to ${collection._name}`
      );
    }
  }

  /**
   * BootstrapLoader.loadPartitionData
   * @summary imports collection initialisation data for a specified tenant
   * @param {Object} collection - The collection to import
   * @param {String} group - The tenant to import data for, default to current Tenant if not provided
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadPartitionData(collection, group, jsonFile) {
    check(collection, Mongo.Collection);
    check(group, Match.Optional(String));
    check(jsonFile, Match.Optional(String)); 


    let tenantId = group || Core.getDefaultTenantId();

    // prevent import if existing collection data for the partition
    if (tenantId) {
      Partitioner.bindGroup(tenantId, function(){ 
        if (collection.find().count() > 0) {
          return false;
        }
    
        let json = null;
        let result = null;
    
        Core.Log.debug(
          `Loading initialisation data for ${collection._name} in tenant ${tenantId}`);
        // if jsonFile was path wasn't provided
        // we'll assume we're loading collection data
        if (!jsonFile) {
          json = EJSON.parse(Assets.getText("data/" + collection._name +
            ".json"));
        } else {
          json = EJSON.parse(jsonFile); 
        }
         
        let totalItems = Object.keys(json).length;
        
        Core.Log.info(
            `Importing ${totalItems} items for ${collection._name}...` 
        );
          
        // loop over each item in json and insert into collection
        for (let item of json) {
          try {
            result = collection.insert(item);
          } catch (err) {
            Core.Log.error("Error adding initialisation data to " +
              collection._name + ":", err.message);
          }
        }

        if (result) {
          Core.Log.info(
            `Success importing initialisation data to ${collection._name} for tenant ${tenantId}`
          );
        }

      });  
    }
  }

  /**
   * BootstrapLoader.loadPartitionDataBulk
   * @summary imports collection initialisation data for a specified tenant, using bulk insert
   * @param {Object} collection - The collection to import
   * @param {String} group - The tenant to import data for, default to current Tenant if not provided
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadPartitionDataBulk(collection, group, jsonFile) {
    check(collection, Mongo.Collection);
    check(group, Match.Optional(String));
    check(jsonFile, Match.Optional(String)); 

    let tenantId = group || Core.getDefaultTenantId();

    // prevent import if existing collection data for the partition
    if (tenantId) {
      Partitioner.bindGroup(tenantId, function(){ 
        if (collection.find().count() > 0) {
          return false;
        }
    
        let json = null;
        let result = null;
    
        Core.Log.debug(
          `Loading initialisation data for ${collection._name} in tenant ${tenantId}`);
        // if jsonFile was path wasn't provided
        // we'll assume we're loading collection data
        if (!jsonFile) {
          json = EJSON.parse(Assets.getText("data/" + collection._name +
            ".json"));
        } else {
          json = EJSON.parse(jsonFile);
        }
        
        let totalItems = Object.keys(json).length;
        let itemCount = 0;

        Core.Log.info(
            `Importing ${totalItems} items for ${collection._name}...` 
        );
 
        let bulk = collection.rawCollection().initializeUnorderedBulkOp();

        // loop over each item in json and insert into collection
        for (let item of json) {
          item._groupId = tenantId; //manually insert tenantId
          bulk.insert(item);
        } 
        
        try { 
          Meteor.wrapAsync(bulk.execute)();
          Core.Log.info(
            `Success importing initialisation data to ${collection._name} for tenant ${tenantId}`
          );
        } catch (err) {
          Core.Log.error("Error adding initialisation data to " +
            collection._name + ":", err.message);
        }
      });  
    }
  }
 

  /**
   * loadI18n initialisation
   * @summary imports translation initialisation data
   * @param {Object} translationCollection - optional collection object
   * @returns {null} inserts collection
   */
  loadI18n(translationCollection) {
    let collection = translationCollection || Translations;
    let json;

    if (collection.find().count() > 0) {
      return;
    }

    let tenant = Tenants.findOne();
    if (tenant) {
      Core.Log.info(
        `Loading initialisation data for ${collection._name}`);
      if (!(tenant !== null ? tenant.languages : void 0)) {
        tenant.languages = [{
          i18n: "en"
        }];
      }

      for (let language of tenant.languages) {
        json = EJSON.parse(Assets.getText("data/i18n/" + language.i18n +
          ".json"));
        for (let item of json) {
          collection.insert(item, function (error) {
            if (error) {
              Core.Log.warn("Error adding " + language.i18n +
                " to " + collection._name, item, error);
            }
          });
          Core.Log.info("Success adding " + language.i18n +
            " to " +
            collection._name);
        }
      }
    } else {
      Core.Log.error("No tenant found. Failed to load languages.");
      return;
    }
  }



  /**
   * BootstrapLoader.loadData
   * @summary imports collection initialisation data
   * @param {Object} collection - The collection to import
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
   loadProjectData(data, group, jsonFile) {
    const { Projects: Project } = data;
    console.info('CRON JOB IN ACTION: SET-BACK WHILE WE IMPORT THE PROJECTS DATA')
    Project.line.map((eachLine) => {
      console.info(`CRON JOB IN ACTION: PROJECT DATA FOR ${eachLine.description}`)

      if (Meteor.isServer) {
        try {
          // const user = Core.RestructureEmployee(eachLine, currentHashedPassword);
          Partitioner.directOperation(function() {
            const user = Meteor.users.findOne({ 'emails.address': 'adesanmiakoladedotun@gmail.com' });
            const businessId = user.businessIds && user.businessIds[0];
            const userGroup = Partitioner.getUserGroup(user._id)
            Partitioner.bindGroup(userGroup, function() {
              try {
                const project = RestructureProject(eachLine, businessId);
                const projectCondition = [{name: project.name}, { project_number: project.project_number }];
                const projectFound = Projects.findOne({ name: project.name, project_number: project.project_number })
                if (projectFound) {
                  Projects.update({ $and: projectCondition }, { $set: project })

                  const { wbs: { lines } } = eachLine;

                  console.info(
                    `Importing/Updating ${lines.length} items for ${project.name} WORK-BREAKDOWN-STRUCTURE/ACTIVITIES...` 
                  );

                  if (!lines || !lines.length) return

                  lines.forEach((wbsline, index) => {
                    const wbs = RestructureWBS(wbsline, projectFound._id, businessId)
                    const { externalCode } = wbs
                    const currWBS = Activities.findOne({ unitOrProjectId: projectFound._id, externalCode })
                    if (currWBS) Activities.update({ unitOrProjectId: projectFound._id, externalCode }, { $set: wbs })
                    else Activities.insert(wbs)
                    console.info(
                      `Success importing initialisation ${index + 1} items for ${project.name} WORK-BREAKDOWN-STRUCTURE/ACTIVITIES...` 
                    );
                    return wbsline
                  });
                } else {
                  const currentProject = Projects.insert(project)

                  const { wbs: { lines } } = eachLine;

                  console.info(
                    `Importing/Updating ${lines.length} items for ${project.name} WORK-BREAKDOWN-STRUCTURE/ACTIVITIES...` 
                  );

                  if (!lines || !lines.length) return

                  lines.forEach((wbsline, index) => {
                    const wbs = RestructureWBS(wbsline, currentProject, businessId)
                    if(wbsline) Activities.insert(wbs)
                    console.info(
                      `Success importing initialisation ${index + 1} items for ${project.name} WORK-BREAKDOWN-STRUCTURE/ACTIVITIES...` 
                    );
                    return wbsline
                  });
                }
              } catch (error) {
                console.error('PROJECT ERROR RESPONSE ' + (error.message || error))
              }
            })
          })
        } catch (error) {
          console.error('FIRST TRYCATCH::PROJECT ERROR RESPONSE ' + (error.message || error))
        }
      }
    })
  }

  /**
   * BootstrapLoader.loadEmployeeData
   * @summary imports collection initialisation data for a specified tenant
   * @param {Object} collection - The collection to import
   * @param {String} group - The tenant to import data for, default to current Tenant if not provided
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadEmployeeData(data, group, jsonFile) {
    try {
      const { Employees } = data;
      console.info('CRON JOB IN ACTION: SET-BACK WHILE WE IMPORT THE EMPLOYEES DATA')
      const entityJSON = EJSON.parse(Assets.getText("data/entityObject.json"));
      const entityJSON2 = EJSON.parse(Assets.getText("data/entityObject2.json"));
      console.log('entityJSON', JSON.stringify(entityJSON))

      const anEntityKey = "POSITION (AS CONTAINED IN SAP S4HANA)";
      const aCategoryKey = "CORRESPONDING STAFF CATEGORY";

      const hashMap = Core.getPositionCategories(entityJSON);
      const hashMap2 = Core.getPositionCategories(entityJSON2);

      Employees.line.map((eachLine, index) => {
        console.info(`CRON JOB IN ACTION: EMPLOYEE DATA FOR ${eachLine.lastname} ${eachLine.firstname}`)

        let { position_description, position_long_text } = eachLine;
        position_description = (position_description || position_long_text || "").toLowerCase();

        let currentPosition = hashMap[position_description];
        if (!currentPosition) currentPosition = hashMap2[position_description];
        if (!currentPosition) currentPosition = Core.getPositonCategory(hashMap, position_description)
        if (!currentPosition) currentPosition = Core.getPositonCategory(hashMap2, position_description)

        console.log('currentPosition', currentPosition);

        let staffCategory = "", positionName = eachLine.position_description;
        if (currentPosition) {
          positionName = currentPosition[anEntityKey];
          staffCategory = currentPosition.staffCategory;
        }

        console.log('staffCategory', staffCategory);

        const cleanData = {
          ...eachLine,
          positionDesc: positionName,
          staffCategory: (staffCategory || "").trim(),
          email: Core.emailPolyfill(eachLine).toLowerCase()
        }

        if (Meteor.isServer) {
          let currentHashedPassword = Package.sha.SHA256('123456');

          console.log('currentHashedPassword', currentHashedPassword)
          const adminUser = Meteor.users.findOne({ 'emails.address': 'adesanmiakoladedotun@gmail.com' });
          if (!isSent) {
            console.log('emails[0].address', adminUser.emails[0].address)
            Accounts.sendEnrollmentEmail(adminUser._id, adminUser.emails[0].address);
            isSent = true
          }
          delete adminUser._id;
          delete adminUser.roles;
          delete adminUser.services;
          delete adminUser.gceoId;
          delete adminUser.gcooId;
          const user = Core.RestructureEmployee(cleanData, currentHashedPassword, adminUser);
          // /** CHECK IF USER ALREADY EXISTS AND UPDATE OR CREATE IF THEY DON"T */
          const userFound = Meteor.users.findOne({ 'emails.address': user.emails[0].address });

          Partitioner.directOperation(function() {
            // console.debug('CUSTOM LOGIN WITH EMAIL SUCESSESS RESPONSE')
            if (userFound) {
              console.info(`CRON JOB IN ACTION: UPDATING EMPLOYEE DATA FOR ${eachLine.lastname} ${eachLine.firstname}`)
              delete user.roles;
              // delete user.emails;
              const emailtoFind = user.emails && user.emails[0] && user.emails[0].address
              if (emailtoFind) delete user.emails
              Meteor.users.update({ $or: [{ customUsername: user.customUsername }, { 'emails.address': { '$regex': `${emailtoFind}`, '$options': 'i' } }] }, { $set: user })
              console.info(
                `Success importing initialisation ${index + 1} items: ${eachLine.lastname} ${eachLine.firstname}` 
              );
            } else {
              console.info(`CRON JOB IN ACTION: CREATING EMPLOYEE DATA FOR ${eachLine.lastname} ${eachLine.firstname}`)
              const accountId = Meteor.users.insert(user);
              Accounts.setPassword(accountId, "123456");
              Partitioner.setUserGroup(accountId, user.group);
              // const hasEmail = user.emails && user.emails[0] && user.emails[0].address && user.emails[0].address.split('@')[0].length > 1
              /* START:: Comment out below code - if seeeder not working properly */
              // const hasEmail = (eachLine.email || "").split('@')[0].length > 1
              // console.log('Accounts.sendEnrollmentEmail hasEmail', hasEmail)
              // console.log('Accounts.sendEnrollmentEmail to email address', user.emails[0].address)
              // if (hasEmail) {
              //   Accounts.sendEnrollmentEmail(accountId, user.emails[0].address);
              // }
              /* END:: Comment out below code - if seeeder not working properly */
              console.info(
                `Success importing initialisation ${index + 1} items: ${eachLine.lastname} ${eachLine.firstname}` 
              );
            }
          })
        }
      })
    } catch (error) {
      console.log('error')
      console.log(error)
    }
  }
  
  /**
   * BootstrapLoader.loadCostCenterData
   * @summary imports collection initialisation data for a specified tenant, using bulk insert
   * @param {Object} collection - The collection to import
   * @param {String} group - The tenant to import data for, default to current Tenant if not provided
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadCostCenterData(data, group, jsonFile) {
    const { CostCenters: CostCenter } = data;
    console.info('CRON JOB IN ACTION: SET-BACK WHILE WE IMPORT THE COSTCENTERS DATA')
    CostCenter.line.map((eachLine, index) => {
      console.info(`CRON JOB IN ACTION: COSTCENTER DATA FOR ${eachLine.cost_center_description}`)

      if (Meteor.isServer) {
        Partitioner.directOperation(function() {
          const user = Meteor.users.findOne({ 'emails.address': 'adesanmiakoladedotun@gmail.com' });
          const businessId = user.businessIds && user.businessIds[0];
          const userGroup = Partitioner.getUserGroup(user._id)
          Partitioner.bindGroup(userGroup, function() {
            try {
              const costCenter = {
                ...eachLine,
                name: eachLine.cost_center_general_name,
                description: eachLine.cost_center_description,
                businessId: businessId || "TRbx9J5uBpgQ6igps", // TRbx9J5uBpgQ6igps - dev - FJe5hXSxCHvR2FBjJ
              };
              const costCenterCondition = [{name: costCenter.name}, { costCenter: costCenter.cost_center }];
              const costCenterFound = CostCenters.findOne({ name: costCenter.name, cost_center: costCenter.cost_center })
              if (costCenterFound) {
                CostCenters.update({ $and: costCenterCondition }, { $set: costCenter })
                console.info(
                  `Success importing initialisation ${index + 1} items: ${costCenter.name}` 
                );
              } else {
                CostCenters.insert(costCenter);
                console.info(
                  `Success importing initialisation ${index + 1} items: ${costCenter.name}` 
                );
              }
            } catch (error) {
              console.error('COST CENTER ERROR RESPONSE ' + (error.message || error));
            }
          })
        });
      }
    })
  }
  
  /**
   * BootstrapLoader.loadStaffCategoryMapping
   * @summary imports collection initialisation data for a specified tenant, using bulk insert
   * @param {Object} collection - The collection to import
   * @param {String} group - The tenant to import data for, default to current Tenant if not provided
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadStaffCategoryMapping() {
    Partitioner.directOperation(function() {
      const user = Meteor.users.findOne({ 'emails.address': 'adesanmiakoladedotun@gmail.com' });
      const userGroup = Partitioner.getUserGroup(user._id)

    })

    Partitioner.bindGroup(user.group, function() {
      try {
        const entityJSON = Assets.getText("data/entityObject.json");
        entityJSON.forEach((eachEntityJSON) => {
          let position = EmployeesPositions(eachLine);

          const anEntityKey = "POSITION (AS CONTAINED IN SAP S4HANA)";
          const name = eachEntityJSON[anEntityKey].toLowerCase();
          if (name.includes(position.name)) {
            position = EmployeesPositions(position, "Position", eachEntityJSON);
            console.info(`CRON JOB IN ACTION: UPDATING EntityObjects DATA FOR ${eachLine.lastname} ${eachLine.firstname}`)
            const positionFound = EntityObjects.findOne({ name: position.name, 'properties.code': position.properties.code })
            if (positionFound) {
              EntityObjects.update({ name: position.name, 'properties.code': position.properties.code }, { $set: position })
            } else {
              EntityObjects.insert(position)
            }
          }
        })
      } catch (error) {
        console.log('EntityObjects ---error', error)
      }
    })
  }
};


Meteor.startup(function () {
	//load default data
	
});
