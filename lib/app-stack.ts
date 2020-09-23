import { InstanceType, Vpc } from "@aws-cdk/aws-ec2";
import { Cluster, EndpointAccess, KubernetesVersion } from "@aws-cdk/aws-eks";
import { Construct, Stack, StackProps } from "@aws-cdk/core";

export class K8sStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, "eks-vpc");
    const cluster = new Cluster(this, "Cluster", {
      vpc: vpc,
      defaultCapacity: 0, // we want to manage capacity ourselves
      version: KubernetesVersion.V1_17,
      // endpointAccess: EndpointAccess.PUBLIC_AND_PRIVATE.onlyFrom("0.0.0.0/0"),
    });

    const ng = cluster.addNodegroup("nodegroup", {
      instanceType: new InstanceType("t3.medium"),
      minSize: 1,
      maxSize: 1,
      desiredSize: 1,
      remoteAccess: {
        sshKeyName: "k8s-on-aws",
      },
    });
  }
}
