import * as azure from "@pulumi/azure";
import * as k8s from "@pulumi/kubernetes";
import * as azuread from "@pulumi/azuread";
import * as config from "./config";
import * as network from "./subnet-microservicios";
import * as shared from "./ResourceShared";
/*
//Creación de  Analitycs Workspace par Monitoreo
const microserviciosloganalytics = new azure.operationalinsights.AnalyticsWorkspace(config.microserviciosloganalytics, {
    resourceGroupName: shared.resourceGroup.name,
    location: shared.resourceGroup.location,
    sku: "PerGB2018",
    retentionInDays: 30,
});
*/

let adApp = new azuread.Application(config.microserviciosazureAplication);
let adSp = new azuread.ServicePrincipal(config.microserviciosazureServicePrincipal, 
    { applicationId: adApp.applicationId 
    }, {dependsOn: adApp});
let adSpPassword = new azuread.ServicePrincipalPassword(config.microserviciosPrincipalPassword, {
    servicePrincipalId: adSp.id,
    value: config.microserviciosPassword,
    endDate: "2099-01-01T00:00:00Z",
},{dependsOn: adSp});


const acrAssignment = new azure.authorization.Assignment(config.microserviciosAcrAssignment, {
    principalId: adSp.id,
    roleDefinitionName: "Contributor",
    scope: shared.acr.id,
}, {dependsOn: [adSp/*,shared.acr*/]});
/*
const kvAssignment = new azure.authorization.Assignment(config.microserviciosKvAssignment, {
    principalId: adSp.id,
    roleDefinitionName: "Reader",
    scope: shared.KeyVault.id,
}, {dependsOn: [adSp, shared.KeyVault]});
*/
const Subnet01Assignment = new azure.authorization.Assignment(config.microserviciosSubnet01Assignment, {
    principalId: adSp.id,
    roleDefinitionName: "Contributor",
    scope: network.microserviciosSubnet01.id,
}, {dependsOn: [adSp, network.microserviciosSubnet01]});

const Subnet02Assignment = new azure.authorization.Assignment(config.microserviciosSubnet02Assignment, {
    principalId: adSp.id,
    roleDefinitionName: "Contributor",
    scope: network.microserviciosSubnet02.id,
}, {dependsOn: [adSp, network.microserviciosSubnet02]});


export const k8sMicroservicios = new azure.containerservice.KubernetesCluster(config.microserviciosKubernetesName, {
    name: config.microserviciosKubernetesName,
    resourceGroupName: shared.resourceGroup.name,
    location: shared.resourceGroup.location,
    agentPoolProfiles: [{
        name: "services",
        count: config.microserviciosNodeCount,
        vmSize: config.microserviciosNodeSize,
        vnetSubnetId: network.microserviciosSubnet01.id,
    }],
    kubernetesVersion: "1.14.7",
    dnsPrefix: "services",
    linuxProfile: {
        adminUsername: "aksuser",
        sshKey: { keyData: config.microserviciossshPublicKey }
    
    },
    servicePrincipal: {
        clientId: adApp.applicationId,
        clientSecret: adSpPassword.value,
    },
    roleBasedAccessControl: { enabled: true },
    networkProfile: {
        networkPlugin: "azure",
        dnsServiceIp: "20.20.0.10",
        serviceCidr: "20.20.0.0/16",
        dockerBridgeCidr: "172.3.0.1/16",
    },

    addonProfile:
    {
       /*//colocar en dependsOn "loganalytics"
        omsAgent: {
            enabled: true,
            logAnalyticsWorkspaceId: microserviciosloganalytics.id,
         },
       */
        aciConnectorLinux: {
            enabled: true,
            subnetName: network.microserviciosSubnet02.name,
         },
     
  
    },
    tags: [{"Created-by": config.createby },{"environment" : config.environment}],
  
}, {dependsOn: [acrAssignment, Subnet01Assignment, Subnet02Assignment, adSpPassword, shared.PostgreSqlServer/*, kvAssignment*/]} );


// Expose a k8s provider instance using our custom cluster instance.
export const k8sProviderMicroservicios = new k8s.Provider("K8sMicroservicios", {
    kubeconfig: k8sMicroservicios.kubeConfigRaw,
},{dependsOn: k8sMicroservicios}
);

// Export the kubeconfig
export const kubeconfigMicroservicios = k8sMicroservicios.kubeConfigRaw;

//Deploy Operator
export const Operatoryaml = new k8s.yaml.ConfigGroup("Operatorms", {

    files: ["cermanager-crd.yaml","cluster-issuer-prod.yaml"]
},
{provider: k8sProviderMicroservicios ,dependsOn: k8sProviderMicroservicios},
);
/*
// Monitoring Diagonostic control plane component logs and AllMetrics
const azMonitoringDiagnostic = new azure.monitoring.DiagnosticSetting(config.microserviciosMonitor, {
    logAnalyticsWorkspaceId: microserviciosloganalytics.id,
    targetResourceId: k8sMicroservicios.id,
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
}, {dependsOn: [k8sMicroservicios, microserviciosloganalytics]},);



export const psqlRuleMicroserviciosSubnet01 = new azure.postgresql.VirtualNetworkRule("subnet01-microservicios", {
    ignoreMissingVnetServiceEndpoint: true,
    name: "subnet01-microservicios",
    resourceGroupName: shared.resourceGroup.name,
    serverName: shared.PostgreSqlServer.name,
    subnetId: network.microserviciosSubnet01.id,
}, {dependsOn: [network.microserviciosSubnet01, k8sMicroservicios] });

export const psqlRuleMicroserviciosSubnet02 = new azure.postgresql.VirtualNetworkRule("subnet02-microservicios", {
    ignoreMissingVnetServiceEndpoint: true,
    name: "subnet02-microservicios",
    resourceGroupName: shared.resourceGroup.name,
    serverName: shared.PostgreSqlServer.name,
    subnetId: network.microserviciosSubnet02.id,
}, {dependsOn: [network.microserviciosSubnet02, psqlRuleMicroserviciosSubnet01]  });*/