#!/bin/sh
NODESCOUNT="$(kubectl get nodes|grep aks| wc -l)"
echo "total nodes $NODESCOUNT"

if [ $NODESCOUNT -eq 3 ] 
then 
  kubectl get nodes -L type -L sub-type 
fi

for value in $(bash -c "echo  {1..$NODESCOUNT}")
do
index=$(($value-1))
if [ $value -eq 1 ]
then
kubectl label nodes $(kubectl get nodes | awk '{print $1}' | grep "$index$")  sub-type=master
kubectl label nodes $(kubectl get nodes | awk '{print $1}' | grep "$index$")  type=elastic
elif [ $value -gt 1 -a $value -le 3 ]
then 
kubectl label nodes $(kubectl get nodes | awk '{print $1}' | grep "$index$")  sub-type=data
kubectl label nodes $(kubectl get nodes | awk '{print $1}' | grep "$index$")  type=elastic
elif [ $value -gt 3 ]
then 
kubectl label nodes $(kubectl get nodes | awk '{print $1}' | grep "$index$")  type=app
kubectl label nodes $(kubectl get nodes | awk '{print $1}' | grep "$index$")  type=app
fi
done



kubectl get nodes -L type -L sub-type
