const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Only ${roles.join(', ')} can perform this action`,
        });
      }
      next();
    };
  };
  
  module.exports = { restrictTo };