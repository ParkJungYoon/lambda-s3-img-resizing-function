const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
   const Bucket = event.Records[0].s3.bucket.name;
   const Key = event.Records[0].s3.object.key;
   const s3obj = { Bucket, Key };

   const newKey = Key.replace("original/", "thumb/"); // 리사이징 된 이미지를 thumb 폴더에 저장

   try {
      //* 객체 불러오기
      const s3Object = await s3.getObject(s3obj).promise(); // 버퍼로 가져오기
      console.log('original size', s3Object.Body.length);

      //* 리사이징
      const resizedImage = await sharp(s3Object.Body)
         .resize(400, 400, { fit: 'inside' }) // 400x400 꽉 차게
         .toFormat(requiredFormat)
         .toBuffer();

      //* 객체 넣기
      await s3
         .putObject({
            Bucket,
            Key: newKey,
            Body: resizedImage,
         })
         .promise();
      console.log('put', resizedImage.length);

      // //* 기존 객체 삭제
      // await s3.deleteObject(s3obj).promise();
      // console.log('del origin img');

      // Lambda 함수 내부에서 모든 작업을 수행한 후에는 그에 대한 결과(또는 오류)와 함께 callback 함수를 호출하고 이를 AWS가 HTTP 요청에 대한 응답으로 처리한다.
      return callback(null, newKey);
   } catch (error) {
      console.error(error);
      return callback(error);
   }
};
