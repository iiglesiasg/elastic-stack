import * as k8s from "@pulumi/kubernetes";
import * as elk from "./aks-elk";
import * as msaks from "./aks-microservicios";

const nginx = new k8s.helm.v2.Chart("nginx-ingress-elk",
    {
        repo: "stable",
        chart: "nginx-ingress",
        
    },  { providers: { kubernetes: elk.k8sProviderelk }, dependsOn: elk.k8sElk }
);

const nginxms = new k8s.helm.v2.Chart("nginx-ingress-ms",
    {
        repo: "stable",
        chart: "nginx-ingress",
        
    },  { providers: { kubernetes: msaks.k8sProviderMicroservicios }, dependsOn: msaks.k8sMicroservicios}
);

const namespace = new k8s.core.v1.Namespace("cert-manager",
    {
        metadata: {
            name: "cert-manager",
            labels: {"certmanager.k8s.io/disable-validation": "true" }
            }
        
    },  { provider: msaks.k8sProviderMicroservicios , dependsOn: msaks.k8sMicroservicios }
);

const certmanagerchart = new k8s.helm.v2.Chart("cert-manager",
    {
        repo: "jetstack",
        chart: "cert-manager",
        namespace: "cert-manager",
        version: "v0.8.0"
        
    },  { providers: { kubernetes: msaks.k8sProviderMicroservicios }, dependsOn: namespace}
);



const elastic = new k8s.helm.v2.Chart("elastic",
    {
        repo: "alicorpacr",
        chart: "elk-operator",
        fetchOpts: {
            username: "alicorpacr", 
            password: "CiRuDD9883jMcGu6NIATyy/lhgPQL3fI"
        }
        
    },  { providers: { kubernetes: elk.k8sProviderelk }, dependsOn: [elk.k8sElk,elk.Operatoryamlelk] }
);

const logstash = new k8s.helm.v2.Chart("logstash",
    {
        repo: "alicorpacr",
        chart: "logstash",
        fetchOpts: {
            username: "alicorpacr", 
            password: "CiRuDD9883jMcGu6NIATyy/lhgPQL3fI"
        }
        
    },  { providers: { kubernetes: elk.k8sProviderelk }, dependsOn: [elk.k8sElk/*,elastic*/] }
);


 