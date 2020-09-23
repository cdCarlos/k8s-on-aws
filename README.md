# Kubernetes on AWS

## Requirements

### NodeJS

Having NodeJS installed is the main prerequisite, follow instruction from [official page](https://nodejs.org/en/) (12.\* LTS).

### AWS CLI

Follow instructions [here](https://aws.amazon.com/cli/) to install AWS CLI and instructions [here](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_credentials) to configure an AWS CLI Profile.

> **IMPORTANT:** Even though you can use AWS environment variables to specify your credentials, it is highly recommended to use profiles instead (DO NOT USE aws default profile). This way you can switch roles/accounts easily while being explicit of what credentials you are using when running commands.

### Docker

Docker version used in this project was `19.03`

### kubectl

This project was tested using kubectl version `1.18`

### Create EC2 Key Pair

```bash
$ aws ec2 create-key-pair --key-name k8s-on-aws --query 'KeyMaterial' --output text > ~/.ssh/k8s-on-aws.pem
$ chmod 400 ~/.ssh/k8s-on-aws.pem
```

### Create Docker Registry

```bash
$ aws ecr create-repository --repository-name k8s-on-aws --profile <aws-profile>
```

This command will output something similart to:

```json
{
  "repository": {
    "repositoryArn": "arn:aws:ecr:<aws-region>:<aws-account>:repository/k8s-on-aws",
    "registryId": "<aws-account>",
    "repositoryName": "k8s-on-aws",
    "repositoryUri": "<aws-account>.dkr.ecr.<aws-region>.amazonaws.com/k8s-on-aws",
    "createdAt": "2020-09-21T13:21:16-05:00",
    "imageTagMutability": "MUTABLE",
    "imageScanningConfiguration": {
      "scanOnPush": false
    },
    "encryptionConfiguration": {
      "encryptionType": "AES256"
    }
  }
}
```

Copy the `repositoryUri` value, it will be used in the following steps.

## Usage

### Install Dependencies

In root folder, install project dependencies: `npm install`

### Run Demo App Locally

To take a look at the app that will be deployed to kubernetes, execute the following command: `npm run app`

This will launch a local development server listening on `localhost:3000` where you will be able to see the app up and running.

To stop the app, just type `Ctl + c` in your terminal.

### Setup Kubernetes Infrastructure

1. For the first time, bootstrap CDK resources in AWS: `npm run deploy:bootstrap -- --profile <aws-profile>`
2. Deploy Kubernetes Stack: `npm run deploy:cluster -- --profile <aws-profile>`

   > **IMPORTANT:** This can take a while to complete... _**Be patient!!**_.

   > **NOTE:** you can run steps 1 and 2 with a single command by executing `npm run deploy`. This will work only if you do not need to specify an AWS profile.

   1. Once the command finishes, you should see in the output some values like these:
      ```log
      Outputs:
      K8SOnAwsStack.ClusterConfigCommand43AAE40F = aws eks update-kubeconfig --name Cluster9EE0221C-36e24e0f7f184f03a8cbd25a8039892b --region <aws-region> --role-arn arn:aws:iam::<aws-account>:role/K8SOnAwsStack-ClusterMastersRole9AA35625-8OK4GLY0USK2
      K8SOnAwsStack.ClusterGetTokenCommand06AE992E = aws eks get-token --cluster-name Cluster9EE0221C-36e24e0f7f184f03a8cbd25a8039892b --region <aws-region> --role-arn arn:aws:iam::<aws-account>:role/K8SOnAwsStack-ClusterMastersRole9AA35625-8OK4GLY0USK2
      ```
   2. Copy and run in your terminal the value of `K8SOnAwsStack.ClusterConfigCommand*`, for example:

      ```bash
      $ aws eks update-kubeconfig --name Cluster9EE0221C-36e24e0f7f184f03a8cbd25a8039892b --region <aws-region> --role-arn arn:aws:iam::<aws-account>:role/K8SOnAwsStack-ClusterMastersRole9AA35625-8OK4GLY0USK2 --profile <aws-profile>
      ```

3. Push docker image to ECR:

   1. Build the docker image: `npm run images:build`
   2. Tag you docker image to `repositoryUri`: `docker tag k8s-on-aws:latest <aws-account>.dkr.ecr.<aw-region>.amazonaws.com/k8s-on-aws:latest`
   3. Update image name in `src/app/ks-app.yaml`, replace `k8s-on-aws:latest` with the tag you just gave to the image (i.e. `<aws-account>.dkr.ecr.<aw-region>.amazonaws.com/k8s-on-aws:latest`)
   4. Docker login to ECR: `aws ecr get-login-password --region <aw-region> --profile <aws-profile> | docker login --username AWS --password-stdin <aws-account>.dkr.ecr.<aw-region>.amazonaws.com`
   5. Push image to ECR: `docker push <aws-account>.dkr.ecr.<aws-region>.amazonaws.com/k8s-on-aws:latest`

4. Deploy app in EKS: `npm run app:deploy`
5. Inspect your resources
6. Make the app accessible:
   1. Update service type from `NodePort` to `LoadBalancer` in the `src/app/ks-app.yaml` file
   2. Update node security group in AWS `*remoteAccess*` to allow inbound traffic to port `80`
   3. Apply the change in the service: `npm run app:update`
7. Access the app in your browser by using the `EXTERNAL-IP` value: `kubectl get service ks-app`
8. Once you are done, delete resources:
   1. `npm run app:destroy`
   2. `npm run destroy:cluster -- --profile <aws-profile>`
