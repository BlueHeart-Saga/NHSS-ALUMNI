const { MongoClient } = require("mongodb");

const SOURCE_URI =
  "mongodb://suman:Sudalairajan%40123@fc-bf2796c8c26b-000.global.mongocluster.cosmos.azure.com:10260/?tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

const SOURCE_DB = "school_alumni_db";

const TARGET_URI = "mongodb://localhost:27017";
const TARGET_DB = "school_alumni_db";

async function migrate() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  try {
    console.log("Connecting to Azure Cosmos DB...");
    await sourceClient.connect();
    console.log("Azure connection successful.");

    console.log("Connecting to local MongoDB...");
    await targetClient.connect();
    console.log("Local connection successful.");

    const sourceDb = sourceClient.db(SOURCE_DB);
    const targetDb = targetClient.db(TARGET_DB);

    const collections = await sourceDb.listCollections().toArray();

    console.log(`Found ${collections.length} collections.`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;

      console.log(`\nCopying: ${collectionName}`);

      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);

      const documents = await sourceCollection.find({}).toArray();

      console.log(`Documents found: ${documents.length}`);

      if (documents.length === 0) {
        await targetCollection.createIndex({ _id: 1 });
        console.log("Empty collection created.");
        continue;
      }

      // Avoid duplicate _id errors if the script is run again.
      await targetCollection.deleteMany({});

      // Insert in batches
      const batchSize = 500;

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);

        await targetCollection.insertMany(batch, {
          ordered: false,
        });

        console.log(
          `Copied ${Math.min(i + batch.length, documents.length)} / ${documents.length}`
        );
      }

      console.log(`✓ ${collectionName} completed`);
    }

    console.log("\n=================================");
    console.log("MIGRATION COMPLETED");
    console.log("=================================");
    console.log(`Source: Azure / ${SOURCE_DB}`);
    console.log(`Target: localhost:27017 / ${TARGET_DB}`);
  } catch (error) {
    console.error("\nMIGRATION FAILED:");
    console.error(error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrate();