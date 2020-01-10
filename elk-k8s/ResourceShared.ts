import * as azure from "@pulumi/azure";
import * as config from "./config";
import * as elk from "./index";


export const resourceGroup = new azure.core.ResourceGroup(config.rgAlicorp, { 
    name: config.rgAlicorp,
    location: config.location,
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
 },);

/*
//Deploy Azure Container Registry
export const acr = new azure.containerservice.Registry(config.azureContainerRegistry, {
    adminEnabled: true,
    location: resourceGroup.location,
    name: config.azureContainerRegistry,
    resourceGroupName: resourceGroup.name,
    sku: "Standard", //primium para acceso solo por la red interna
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
} );
*/

export const acr = azure.containerservice.getRegistry({
    name: "alicorpacr",
    resourceGroupName: "example01",
});



//Deploy Server PostgreSQL
export const PostgreSqlServer = new azure.postgresql.Server(config.PostgreSql, {
    name: config.PostgreSql,
    administratorLogin: "userdb",
    administratorLoginPassword: "Passw0rd2019$",
    location: resourceGroup.location,
    resourceGroupName: resourceGroup.name,
    sku: {
        capacity: 2,
        family: "Gen5",
        name: "GP_Gen5_2",
        tier: "GeneralPurpose",
    },
    sslEnforcement: "Disabled",
    storageProfile: {
        backupRetentionDays: 7,
        geoRedundantBackup: "Disabled",
        storageMb: 51200,
    },
    version: "10",
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
});



/*
//Deploy Database Sonar
export const SonarQubeDatabase = new azure.postgresql.Database("sonarqubedb", {
    charset: "UTF8",
    collation: "English_United States.1252",
    name: "sonarqubedb",
    resourceGroupName:  resourceGroup.name,
    serverName: PostgreSqlServer.name,
}, {dependsOn: PostgreSqlServer });
*/
//Deploy Database Hasura
export const HasuraDatabase = new azure.postgresql.Database("hasuradb", {
    charset: "UTF8",
    collation: "English_United States.1252",
    name: "hasuradb",
    resourceGroupName: resourceGroup.name,
    serverName: PostgreSqlServer.name,
}, {dependsOn: [PostgreSqlServer/*, SonarQubeDatabase*/] });


//Deploy cosmoDB
export const CosmoDB = new azure.cosmosdb.Account(config.CosmoDB, {
    consistencyPolicy: {
        consistencyLevel: "BoundedStaleness",
    },
    enableAutomaticFailover: true,
    geoLocations: [
        {
            failoverPriority: 0,
            location: resourceGroup.location,
        },
 
    ],
    kind: "GlobalDocumentDB",
    location: resourceGroup.location,
    name: config.CosmoDB,
    offerType: "Standard",
    resourceGroupName: resourceGroup.name,
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
});



//Deploy Redis
export const Redis = new azure.redis.Cache(config.Redis, {
    capacity: 1,
    enableNonSslPort: false,
    family: "C",
    location: resourceGroup.location,
    name: config.Redis,
    resourceGroupName: resourceGroup.name,
    skuName: "Basic",
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
});

//Deploy CDN
export const CDN = new azure.cdn.Profile(config.CDN, {
    location: resourceGroup.location,
    name: config.CDN,
    resourceGroupName: resourceGroup.name,
    sku: "Standard_Verizon",
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
});


//Deploy Key Vault
export const KeyVault = new azure.keyvault.KeyVault(config.KeyVault, {
    location: resourceGroup.location,
    name: config.KeyVault,
    resourceGroupName: resourceGroup.name,
    skuName: "standard",
    tenantId: "f567b0f5-6365-4b7a-8579-c9300006c8a4",
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
});
