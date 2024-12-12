// import React from "react";
import { Navigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { getUserFromStorage } from "../../utils/getUserFromStorage";

const AuthRoute = ({ children }) => {
  //get the token
  const token = getUserFromStorage();

  if (token) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

AuthRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthRoute;
