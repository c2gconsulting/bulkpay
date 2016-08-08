Events = new Mongo.Collection("events");
Partitioner.partitionCollection(Events);
Events.attachSchema(Core.Schemas.Event);

Logs = new Mongo.Collection("logs");
Partitioner.partitionCollection(Logs);
Logs.attachSchema(Core.Schemas.Log);
