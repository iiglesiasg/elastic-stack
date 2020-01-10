import * as azure from "@pulumi/azure";
import * as config from "./config";
import * as shared from "./ResourceShared";
import * as network from "./network";

//Deploy Network Security Group
const elkNetworkSecurityGroup = new azure.network.NetworkSecurityGroup(config.elkNetworkSecurityGroup, {
    location: shared.resourceGroup.location,
    name: config.elkNetworkSecurityGroup,
    resourceGroupName: shared.resourceGroup.name,
    securityRules: [{
        access: "Allow",
        destinationAddressPrefix: "*",
        destinationPortRange: "*",
        direction: "Inbound",
        name: "aksAllTrafficPermit",
        priority: 100,
        protocol: "*",
        sourceAddressPrefix: "*",
        sourcePortRange: "*",
    }], 
 });

//Deploy Subnet01 AKS Nodes
export const elkSubnet01 = new azure.network.Subnet(config.elkSubnet01, {
    addressPrefix: "172.10.2.0/24",
    name: config.elkSubnet01,
    resourceGroupName: shared.resourceGroup.name,
    virtualNetworkName: network.VirtualNet.name,
    serviceEndpoints: ["Microsoft.Sql", "Microsoft.Storage", "Microsoft.ContainerRegistry", "Microsoft.AzureCosmosDB", "Microsoft.KeyVault", "Microsoft.ServiceBus", "Microsoft.AzureActiveDirectory", "Microsoft.EventHub"],
 
}, {dependsOn: network.VirtualNet});

const elkSubnetSecurityGroupAssociation01 = new azure.network.SubnetNetworkSecurityGroupAssociation(config.elkSubnetSecurityGroupAssociation01, {
    networkSecurityGroupId: elkNetworkSecurityGroup.id,
    subnetId: elkSubnet01.id,
}, {dependsOn:  [elkSubnet01, elkNetworkSecurityGroup]});
