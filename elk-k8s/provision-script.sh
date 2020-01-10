#!/bin/sh
echo install dependencies. NPM requiered
npm install
echo start pulumi deploy
pulumi up  -y
echo set kubeconfig
az aks get-credentials --resource-group RG-Alicorp-Pulumi-dev --name k8s-elk-dev

echo install elastic operator
kubectl apply -f https://download.elastic.co/downloads/eck/0.9.0/all-in-one.yaml
echo "sync helm ## esto no es necesario si llamamos a otro pulumi pa desplegar helms"
helm init --upgrade
kubectl create serviceaccount --namespace kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
kubectl patch deploy --namespace kube-system tiller-deploy -p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}'
az acr helm repo add -n alicorpacr
helm repo update
sleep 5
helm install alicorpacr/elk-operator
helm install alicorpacr/logstash
