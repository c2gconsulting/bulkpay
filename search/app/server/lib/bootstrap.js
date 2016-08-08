// function to verify that all environment variables are defined and loaded
const getSetStatus = (env, systemEnv) => systemEnv[env] ? true : false;
const verifySystemEnv = () => {
  const processEnv = ['CLUSTER_DISCOVERY_URL', 'CLUSTER_SERVICE', 'CLUSTER_PUBLIC_SERVICES' /*'SEARCH_MONGO_URL'*/];
  const serverEnv = process.env;
  const unsetEnv = [];
  _.each(processEnv, env => {
    if (!getSetStatus(env, serverEnv)) {
      unsetEnv.push(env);
    }
  });
  if (unsetEnv.length > 0) {
    throw new Meteor.Error(400, `The following environment variables are not defined: ${unsetEnv.join(', ')}. Set and restart server.`);
  }
};


/*
* Function to generate watchers
* */
const generateWatchers = () => {
  var watcherArray = [];
  var keys = Object.keys(SearchService.IndexType);
  _.each(keys, key => {
    var index = SearchService.IndexType[key][0];
    var type = SearchService.IndexType[key][1];
    watcherArray.push({
      collectionName: type,
      index: index,
      type: type,
      transformFunction: SearchService.processDocument,
      fetchExistingDocuments: true,
      priority: SearchService.generics.indexOf(type) !== -1 ? 0 : 1
    });
  });
  return watcherArray;
};


const triggerMongoSync = () => {
  ESMongoSync.init(null, null, null, SearchService.init, generateWatchers(), process.env.BATCH_COUNT);
};

/*
 * Execute start up
 */
Meteor.startup(() => {
  verifySystemEnv();
  triggerMongoSync();
  SyncedCron.start();
});
