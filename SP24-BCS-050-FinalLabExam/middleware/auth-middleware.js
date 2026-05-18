// Check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash("error", "Please log in to access this page");
  res.redirect("/login");
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.userRole === "admin") {
    return next();
  }
  res.status(403).render("access-denied", { 
    message: "This page is for admins only." 
  });
};

module.exports = { isLoggedIn, isAdmin };