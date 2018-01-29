import jwt from "jsonwebtoken";

JWT = {};

JWT.verifyAuthorizationToken = (urlParams) => {
  if(!urlParams) {
    throw new Meteor.Error(403, 'No authentication token specified');
  }

  const token = urlParams['token'];
  if(!token) {
    throw new Meteor.Error(403, 'No authentication token specified');
  }

  const jwtSecret = process.env.JWT_SECRET;

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (e) {
      throw new Meteor.Error(403, e.message);   
  }

  if(!decoded) {
      throw new Meteor.Error(403, 'Invalid token');
  }
  return decoded;
}
