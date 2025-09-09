import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = React.createContext();

function AuthProvider(props) {
  const [state, setState] = useState({
    loading: null,
    error: null,
    user: null,
  });
  const navigate = useNavigate()
  const login = async ({ username, password }) => {
    try {
      const res = await axios.post("http://localhost:4000/login", {
        username,
        password,
      });
      const token = res.data.token;
      localStorage.setItem("token", token);
      const user = jwtDecode(token);
      setState({ ...state, user });
    } catch (error) {
      console.log(error);
    }
  };
  

  const register = async ({ username, firstName, lastName, password }) => {
    try {
      await axios.post("http://localhost:4000/register", {
        username,
        firstName,
        lastName,
        password,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
      localStorage.removeItem("token")
      setState(null)
      navigate("/")
    }
  

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <AuthContext.Provider
      value={{ state, login, logout, register, isAuthenticated }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

// this is a hook that consume AuthContext
const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
