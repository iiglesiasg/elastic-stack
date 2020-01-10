import * as azure from "@pulumi/azure";
import * as config from "./config";
import * as shared from "./ResourceShared";

/*
//Deploy DDoS
const elkDdosPlan = new azure.network.DdosProtectionPlan(config.DdosPlan, {
    location: shared.resourceGroup.location,
    name: config.DdosPlan,
    resourceGroupName: shared.resourceGroup.name,
});
*/
//Deploy Virtual Network
export const VirtualNet = new azure.network.VirtualNetwork(config.VirtualNet, {
    name: config.VirtualNet,
    location: shared.resourceGroup.location,
    resourceGroupName: shared.resourceGroup.name,    
    addressSpaces: ["172.10.0.0/16"],
    /*
    ddosProtectionPlan: {
        enable: true,
        id: elkDdosPlan.id,
    },
 
    dnsServers: [
        "100.100.0.4",
    ],
    */
});