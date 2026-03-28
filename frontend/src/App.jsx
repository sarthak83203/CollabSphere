import React from "react";
import Landing from "./pages/Landing";
import {Route,BrowserRouter as Router,Routes} from "react-router-dom";
export default function App(){
  return(
   <div>
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>}/>
      </Routes>
    </Router>
   </div>
  );
}