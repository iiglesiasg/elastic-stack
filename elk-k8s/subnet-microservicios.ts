import * as azure from "@pulumi/azure";
import * as config from "./config";
import * as shared from "./ResourceShared";
import * as network from "./network";
//Deploy Network Security Group
const microserviciosNetworkSecurityGroup = new azure.network.NetworkSecurityGroup(config.microserviciosNetworkSecurityGroup, {
    location: shared.resourceGroup.location,
    name: config.microserviciosNetworkSecurityGroup,
    resourceGroupName: shared.resourceGroup.name,
    /*securityRules: [{
        access: "Allow",
        destinationAddressPrefix: "*",
        destinationPortRange: "*",
        direction: "Inbound",
        name: "aksAllTrafficPermit",
        priority: 100,
        protocol: "*",
        sourceAddressPrefix: "*",
        sourcePortRange: "*",
    }], */
 });

//Deploy Subnet01 AKS Nodes
export const microserviciosSubnet01 = new azure.network.Subnet(config.microserviciosSubnet01, {
    addressPrefix: "172.10.0.0/24",
    name: config.microserviciosSubnet01,
    resourceGroupName: shared.resourceGroup.name,
    virtualNetworkName: network.VirtualNet.name,
    serviceEndpoints: ["Microsoft.Sql", "Microsoft.Storage", "Microsoft.ContainerRegistry", "Microsoft.AzureCosmosDB", "Microsoft.KeyVault", "Microsoft.ServiceBus", "Microsoft.AzureActiveDirectory", "Microsoft.EventHub"],
 
}, {dependsOn: network.VirtualNet});

const microserviciosSubnetSecurityGroupAssociation01 = new azure.network.SubnetNetworkSecurityGroupAssociation(config.microserviciosSubnetSecurityGroupAssociation01, {
    networkSecurityGroupId: microserviciosNetworkSecurityGroup.id,
    subnetId: microserviciosSubnet01.id,
}, {dependsOn:  [microserviciosSubnet01, microserviciosNetworkSecurityGroup]});

// Deploy Subnet02 ACI
export const microserviciosSubnet02 = new azure.network.Subnet(config.microserviciosSubnet02, {
    addressPrefix: "172.10.1.0/24",
    name: config.microserviciosSubnet02,
    resourceGroupName: shared.resourceGroup.name,
    virtualNetworkName: network.VirtualNet.name,
    serviceEndpoints: ["Microsoft.Sql", "Microsoft.Storage", "Microsoft.ContainerRegistry", "Microsoft.AzureCosmosDB", "Microsoft.KeyVault", "Microsoft.ServiceBus", "Microsoft.AzureActiveDirectory", "Microsoft.EventHub"],
 
}, {dependsOn: [microserviciosSubnet01, microserviciosSubnetSecurityGroupAssociation01 ]});

const microserviciosSubnetSecurityGroupAssociation02 = new azure.network.SubnetNetworkSecurityGroupAssociation(config.microserviciosSubnetSecurityGroupAssociation02, {
    networkSecurityGroupId: microserviciosNetworkSecurityGroup.id,
    subnetId: microserviciosSubnet02.id,
}, {dependsOn:  microserviciosSubnet02 });