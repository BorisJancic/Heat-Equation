import './App.css';

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HeatFlow from './pages/HeatFlow';

function App() {
  return (
      <Routes> 
        <Route path='/' element={<HeatFlow/>}></Route>        
        <Route path='/*' element={<HeatFlow/>}></Route>
      </Routes> 
  );
}

export default App;