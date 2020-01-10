import * as pulumi from "@pulumi/pulumi";

//var num = String(Math.round(Math.random()*99));
// Recursos Compartidos
const config = new pulumi.Config('azure-alicorp');
export const location = config.require("location")
export const environment = config.require('environment')
export const createby = config.require('createby')
export const groupcode = config.require('group-code')
export const prefix = environment.concat("-".concat(groupcode).concat("-"))

export const rgAlicorp = prefix.concat("rg-alicorp");
//export const azureContainerRegistry = "acrAlicorp1".concat(environment); 
export const PostgreSql = prefix.concat("psql-alicorp");          
export const KeyVault = prefix.concat("keyvault-alicorp")
export const Redis = prefix.concat("redis-alicorp")
export const CosmoDB = prefix.concat("cosmodb-alicorp");
export const CDN = prefix.concat("cdn-alicorp")

export const DdosPlan = prefix.concat("ddos")
export const VirtualNet =  prefix.concat("vnet")

//AKS Microservicios
export const microserviciosPassword = config.require("password");
export const microserviciossshPublicKey = config.require("sshkey");
export const microserviciosNodeCount = config.getNumber("nodeCount") || 3;
export const microserviciosNodeSize = config.get("nodeSize") || "Standard_DS1_v2";

const name = prefix.concat("aks-microservicios")  
export const microserviciosNetworkSecurityGroup = name.concat("-nsg");
export const microserviciosSubnet01 = name.concat("-subnet01");
export const microserviciosSubnet02 = name.concat("-subnet02");
export const microserviciosSubnetSecurityGroupAssociation01 = name.concat("-sga01")
export const microserviciosSubnetSecurityGroupAssociation02 = name.concat("-sga02")
export const microserviciosloganalytics = name.concat("-la")
export const microserviciosazureAplication =  name.concat("-app")
export const microserviciosazureServicePrincipal = name.concat("-sp")
export const microserviciosPrincipalPassword =  name.concat("spPassword")
export const microserviciosAcrAssignment = name.concat("-acrAssignment")
export const microserviciosKvAssignment = name.concat("-kvAssignment")
export const microserviciosSubnet01Assignment = name.concat("-Subnet01Assignment")
export const microserviciosSubnet02Assignment = name.concat("-Subnet02Assignment")
export const microserviciosKubernetesName = name
export const microserviciosMonitor = name.concat("Monitor")

//AKS ELK
export const elkPassword = config.require("password");
export const elksshPublicKey = config.require("sshkey");
export const elkNodeCount = config.getNumber("nodeCount") || 2;
export const elkNodeSize = config.get("nodeSize") || "Standard_DS3_v2";

const name01 = prefix.concat("elk")
export const elkNetworkSecurityGroup = name01.concat("-sg")
export const elkSubnet01 = name01.concat("subnet01")
export const elkSubnet02 = name01.concat("subnet02")
export const elkSubnetSecurityGroupAssociation01 = name01.concat("-sga01")
export const elkSubnetSecurityGroupAssociation02 = name01.concat("-sga02")
export const elkloganalytics = name01.concat("-la")
export const elkazureAplication =  name01.concat("-app")
export const elkazureServicePrincipal = name01.concat("-sp")
export const elkPrincipalPassword = name01.concat("-spPassword")
export const elkAcrAssignment = name01.concat("-acrAssignment")
export const elkKvAssignment = name01.concat("-kvAssignment")
export const elkSubnet01Assignment = name01.concat("-Subnet01Assignment")
export const elkSubnet02Assignment = name01.concat("Subnet02Assignment")
export const elkKubernetesName = name01
export const elkMonitor = name01.concat("Monitor")
