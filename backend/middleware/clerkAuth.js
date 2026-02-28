const { clerkClient } = require('@clerk/clerk-sdk-node');

const authenticateClerkUser = async (req, res, next) => {
  const { authorization } = req.headers;
  
  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header is required'
    });
  }

  try {
    const token = authorization.replace('Bearer ', '');
    
    // Verify the Clerk session token
    const session = await clerkClient.sessions.verifySessionToken(token);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token'
      });
    }

    // Get user information
    const user = await clerkClient.users.getUser(session.userId);
    
    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.publicMetadata?.role || 'user',
      imageUrl: user.imageUrl
    };

    next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = authenticateClerkUser;