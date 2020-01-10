import * as azure from "@pulumi/azure";
import * as k8s from "@pulumi/kubernetes";
import * as azuread from "@pulumi/azuread";
import * as config from "./config";
import * as network from "./subnet-elk";
import * as shared from "./ResourceShared";

/*
//Creación de  Analitycs Workspace par Monitoreo
const elkloganalytics = new azure.operationalinsights.AnalyticsWorkspace(config.elkloganalytics, {
    resourceGroupName: shared.resourceGroup.name,
    location: shared.resourceGroup.location,
    sku: "PerGB2018",
    retentionInDays: 30,
});
*/

export const adAppELK = new azuread.Application(config.elkazureAplication);
let adSp = new azuread.ServicePrincipal(config.elkazureServicePrincipal, 
    { applicationId: adAppELK.applicationId 
    }, {dependsOn: adAppELK});
let adSpPassword = new azuread.ServicePrincipalPassword(config.elkPrincipalPassword, {
    servicePrincipalId: adSp.id,
    value: config.elkPassword,
    endDate: "2099-01-01T00:00:00Z",
},{dependsOn: adSp});


const acrAssignment = new azure.authorization.Assignment(config.elkAcrAssignment, {
    principalId: adSp.id,
    roleDefinitionName: "Contributor",
    scope: shared.acr.id,
}, {dependsOn: adSp});

/*
const storageAccount = new azure.storage.Account("alicorpstorage", {
    resourceGroupName: shared.resourceGroup.name,
    accountReplicationType: "LRS",
    accountTier: "Standard",
    name: "alicorpstorage",
    location:shared.resourceGroup.location,
    tags: {"Created-by": config.createby},  //| {"environment" : config.environment},
});

const storageFileShare = new azure.storage.Share("azurefileshare", {
    name: "azurefileshare",
    storageAccountName: storageAccount.name,
    resourceGroupName: shared.resourceGroup.name,
    quota: 50
})
*/
const Subnet01Assignment = new azure.authorization.Assignment(config.elkSubnetSecurityGroupAssociation01, {
    principalId: adSp.id,
    roleDefinitionName: "Contributor",
    scope: network.elkSubnet01.id,
}, {dependsOn: [adSp, network.elkSubnet01]});

export const k8sElk = new azure.containerservice.KubernetesCluster(config.elkKubernetesName, {
    name: config.elkKubernetesName,
    resourceGroupName: shared.resourceGroup.name,
    location: shared.resourceGroup.location,
    agentPoolProfiles: [{
        name: "elk",
        count: config.elkNodeCount,
        vmSize: config.elkNodeSize,
        vnetSubnetId: network.elkSubnet01.id,
    }],
    kubernetesVersion: "1.14.7",
    dnsPrefix: "elk",
    linuxProfile: {
        adminUsername: "aksuser",
        sshKey: { keyData: config.elksshPublicKey }
    
    },
    servicePrincipal: {
        clientId: adAppELK.applicationId,
        clientSecret: adSpPassword.value,
    },
    roleBasedAccessControl: { enabled: true },
    networkProfile: {
        networkPlugin: "azure",
        dnsServiceIp: "15.15.0.10",
        serviceCidr: "15.15.0.0/16",
        dockerBridgeCidr: "172.2.0.1/16",
    },
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
  
}, {dependsOn: [acrAssignment, Subnet01Assignment, adSpPassword]} );


// Expose a k8s provider instance using our custom cluster instance.
export const k8sProviderelk = new k8s.Provider("K8selk", {
    kubeconfig: k8sElk.kubeConfigRaw,
},{dependsOn: k8sElk}
);

// Export the kubeconfig
export const kubeconfigelk = k8sElk.kubeConfigRaw;


//Deploy Operator
export const Operatoryamlelk = new k8s.yaml.ConfigGroup("Operator", {

    files: ["elastic-operator.yaml"]
},
{provider: k8sProviderelk ,dependsOn: k8sProviderelk},
);
/*
// Monitoring Diagonostic control plane component logs and AllMetrics
const azMonitoringDiagnostic = new azure.monitoring.DiagnosticSetting(config.elkMonitor, {
    logAnalyticsWorkspaceId: elkloganalytics.id,
    targetResourceId: k8sElk.id,
    logs:  [{
        category: "kube-apiserver",
        enabled : true,

        retentionPolicy: {
        enabled: true,
        }
    },
    ],
    metrics: [{
        category: "AllMetrics",

        retentionPolicy: {
        enabled: true,
        }
    }],
}, {dependsOn: [k8sElk, elkloganalytics]},);
*/
