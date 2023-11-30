import { CognitoJwtVerifier } from 'aws-jwt-verify';

exports.handler = async function(event) {
  const mapGroupsToPaths = [{
  path: '/AutokaasDeptLambda/admins',
  group: 'Admin'
}, {
  path: '/AutokaasDeptLambda/developers',
  group: 'Developer'
}];
  
  // get the requested path from the API Gateway event
  const requestPath = event.requestContext.http.path
  const existingPaths = mapGroupsToPaths.map((config) => config.path)
  if (!existingPaths.includes(requestPath)) {
    console.log('Invalid path')
    return {
      isAuthorized: false
    }
  }

  const authHeader = event.headers.authorization
  if (!authHeader) {
    console.log('No auth header')
    return {
      isAuthorized: false
    }
  }
  const token = authHeader.split(' ')[1] // header has a 'Bearer TOKEN' format
  
 // const token = authHeader

  // the package verifies the token
  // specify if you want to verify ID or access token
  const verifier = CognitoJwtVerifier.create({
    userPoolId: 'eu-north-1_m6dwTbVvC',
    tokenUse: 'id', // or tokenUse: 'id' for ID tokens
    clientId: '6pt6qoaffm6344hu7la96t2i6f',
  });

  let payload
  try {
    payload = await verifier.verify(token);
    console.log('Token is valid. Payload:', payload);
  } catch {
    console.log('Token not valid!');
    return {
      isAuthorized: false
    }
  }

  const matchingPathConfig = mapGroupsToPaths.find(
    (config) => requestPath === config.path
  )
  const userGroups = payload['cognito:groups']
  if (userGroups.includes(matchingPathConfig.group)) {
    console.log('Group matched...');
    return {
      isAuthorized: true
    }
  } else {
    console.log('Group NOT matched...');
  }
  
  return {
    isAuthorized: false
  }
}
