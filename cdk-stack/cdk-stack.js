const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');
const cloudfront = require('@aws-cdk/aws-cloudfront');
const s3deploy = require('@aws-cdk/aws-s3-deployment');

class CdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    /* Create S3 bucket, define it's index and error pages
       Allow public read access */
    const bucket = new s3.Bucket(this, 'alpackedbucket', {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404/index.html",
      publicReadAccess: true,
    });
    /* Create  Cloudfront distribution
       Source it to S3 Bucket */
    const distribution = new cloudfront.CloudFrontWebDistribution(this, "alpackeddistribution", {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket
            },
            behaviors : [ {isDefaultBehavior: true}]
          }
        ]
    });
    /* Deploy builded site from building output directory to S3 root directory
       Drop all the Cloudfront cache so it will display newly deployed content*/
    new s3deploy.BucketDeployment(this, 'BucketDeployment', {
      destinationBucket: bucket,
      sources: [s3deploy.Source.asset("../public")],
      distribution: distribution,
      distributionPaths: ["/*"],
    });
  }
}

module.exports = { CdkStack }
