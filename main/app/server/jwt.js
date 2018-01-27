import jwt from "jsonwebtoken";

JWT = {};

JWT.verifyAuthorizationToken = (request) => {  
  const token = request.queryString['token'];
  if(!token) {
    throw new Meteor.Error(403, 'Invalid authorization');         
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
  return true;
}
