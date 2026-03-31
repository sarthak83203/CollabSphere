import React from "react";
import Landing from "./pages/Landing.jsx";
import {Route,BrowserRouter as Router,Routes} from "react-router-dom";
import Authentication from "./pages/Authentication.jsx";
export default function App(){
  return(
   <div>
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/auth" element={<Authentication/>}/>
      </Routes>
    </Router>
   </div>
  );
}