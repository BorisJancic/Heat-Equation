import "./HeatFlow.css"

import React, {useState, useRef, useEffect} from 'react'
import Plot from 'react-plotly.js'

import Canvas from '../components/Canvas'
import DarkModeSelector from '../components/DarkModeSelector'

import {Dirichlet} from '../helper_functions/Dirichlet'
import {Neumann} from '../helper_functions/Neumann'

/*TODO
*/

const HeatFlow = () => {
  const WHITE_BACKGROUND = '#FAFAFA';
  const WHITE_BORDER = '#F0F0F0';
  const BLACK_BACKGROUND = '#0A0A0A';
  const BLACK_BORDER = '#0F0F0F';
  const MIN_BLOCKS = 10;
  const MAX_BLOCKS = 100;
  const DEFAULT_BLOCKS = 40;
  const ZOOM = 0.9;
  const DEFAULT_CAMERA = {eye: {x: ZOOM*1.1, y: ZOOM*-1.5, z: ZOOM*0.8}};
  const [resetCanvas, setResetCanvas] = useState(false);
  const [blocksCanvas, setBlocksCanvas] = useState(DEFAULT_BLOCKS);
  const [selectBlocks, setSelectBlocks] = useState(DEFAULT_BLOCKS);
  const [pingTempCanvas, setPingTempCanvas] = useState(false);
  const [condition, setCondition] = useState("Dirichlet");
  const [result, setResult] = useState([]);
  const [alpha, setAlpha] = useState(100);
  const [plotSize, setPlotSize] = useState(0);
  const [camera, setCamera] = useState(DEFAULT_CAMERA);
  const [plotFontColor, setPlotFontColor] = useState('black');
  const [plotBackgroundColor, setPlotBackgroundColor] = useState('white');
  const initialScroll = useRef(-1);
  const flagRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [borderColor, setBorderColor] = useState('black');


  useEffect(() => {
      window.addEventListener('resize', handleResize);
      handleResize();
  }, []);
  const isInitialAlpha = useRef(true);
  useEffect(() => {
      if (isInitialAlpha.current) { isInitialAlpha.current = false; }
      else { handleCompute(); }
  }, [alpha]);
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      document.querySelector('link[rel="icon"]').href = `${process.env.PUBLIC_URL}/favicon-dark.ico`
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      setPlotFontColor(WHITE_BORDER);
      setPlotBackgroundColor(BLACK_BACKGROUND);
      setBorderColor(WHITE_BORDER);
    } else {
      document.querySelector('link[rel="icon"]').href = `${process.env.PUBLIC_URL}/favicon.ico`
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      setPlotFontColor(BLACK_BORDER);
      setPlotBackgroundColor(WHITE_BACKGROUND);
      setBorderColor(BLACK_BORDER);
    }
  }, [darkMode]);


  function handleResetCanvas() {
    setResetCanvas(!resetCanvas);
  }
  function handleSelectBlocks(event) { setSelectBlocks(event.target.value); }
  function handleKeyPress(event) {
    if (event.key ==='Enter') { handleSetBlocksCanvas(); }
  }
  function handleSetBlocksCanvas() {
    let blocks = selectBlocks;

    const popup = document.getElementById('popup');

    if (blocks < MIN_BLOCKS || blocks > MAX_BLOCKS) {
      console.log("Select a value between 20 and 50");
      popup.classList.add('show');
      setTimeout(function() {
        popup.classList.remove('show');
      }, 3000);
    } else if (blocks !== blocksCanvas) {
      setBlocksCanvas(blocks);
      popup.classList.remove('show');
    }
  }
  function handleCompute() {
    setPingTempCanvas(!pingTempCanvas);
  }
  function handleSetCondition() {
    if (condition === "Neumann") { setCondition("Dirichlet")}
    else { setCondition("Neumann"); }
    handleCompute();
  }
  function handleSetAlpha(event) {
    setAlpha(event.target.value * 50);
  }
  function handleRecvTemp(temperature) {
    if (++initialScroll.current === 1) {
      flagRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    var temp = [...temperature];
    for (var i = 0; i < temp.length; i++) {
      temp[i] *= 100; // bug?
    }
    var x;
    if (condition === "Neumann") {
      x = Neumann(temp, 0.1, 100, alpha).result;
    } else {
      x = Dirichlet(temp, 0.1, 100, alpha).result;
    }
    setResult(x);
  }
  const handleResize = () => {
    let size = Math.floor(0.8*Math.min(window.innerWidth, window.innerHeight));
    setPlotSize(size);
  };
  function handleRelayout(eventData) {
    if (eventData['scene.camera']) { setCamera(eventData['scene.camera']); }
  };
  function handleResetCamera() { setCamera(DEFAULT_CAMERA); }

  const data = [{
    z: result,
    type: 'surface',
    showscale: false,
    contours: {
      z: { show:true, usecolormap: true, highlightcolor:"#42f462", project:{z: true} }
    },
    xaxis: { title: 'X Axis Label' },
    yaxis: { title: 'Y Axis Label' },
    zaxis: { title: 'Z Axis Label' }
  }];

  const layout = {
    paper_bgcolor: plotBackgroundColor,
    titlefont: { color: plotFontColor },
    tickfont: { color: plotFontColor },
    title: {
      text: 'Heat Distribution',
      yanchor: 'bottom',
      y: 0.9
    },
    scene: {
      camera: camera,
      aspectratio: { x: 0.8, y: 0.8, z: 0.8 },
      xaxis: { title: 'Distance', color: plotFontColor },
      yaxis: { title: 'Time', color: plotFontColor },
      zaxis: { title: 'Temperature', color: plotFontColor }
    },
    autosize: true,
    width: plotSize * 0.9,
    height: plotSize * 0.8,
    margin: { l: 0, r: 0, b: 30, t: 0, pad: 1000 },
  };

  // function handleDarkMode(dark_mode) {
  //   setDarkMode(dark_mode);
  // }

  return (
    <div className={darkMode ? 'dark-theme' : 'light-theme'}>
      <p className="name_paragraph">Boris Jancic</p><br/>

      <div className="header-container">
        <h1 className='title'>1D Heat Equation</h1>
        <div className="right-div">
          <DarkModeSelector
              darkMode={darkMode}
              // recvDarkMode={handleDarkMode}
              recvDarkMode={setDarkMode}
          />
        </div>
      </div>

      <div className="canvas_container">
          <Canvas
            style={{border: '1px solid black'}}
            reset={resetCanvas}
            blocks={blocksCanvas}
            pingTemp={pingTempCanvas}
            recvTemp={handleRecvTemp}
            darkMode={darkMode}
          />
      </div>

      <div className="input_container">
          <div className="input">
              <button className="button" onClick={handleResetCanvas}>Reset</button><br/>
          </div>
          <div className="input">
              <button className="button" onClick={handleSetBlocksCanvas}>Set Blocks</button>
              <input
                className="input_blocks"
                type='number'
                min={MIN_BLOCKS} max={MAX_BLOCKS}
                placeholder={DEFAULT_BLOCKS}
                onChange={handleSelectBlocks}
                onKeyUpCapture={handleKeyPress}
              /><br/>
              <div id="popup" class="popup">Input must be between {MIN_BLOCKS} and {MAX_BLOCKS}</div>
          </div>
          <div className="input">
              <input onClick={handleSetCondition} type="checkbox" id="toggle_cond" className="toggleCheckbox" />
              <label htmlFor="toggle_cond" className="toggleContainer">
                <div>Fixed</div> 
                <div>Insulated</div>
              </label>
          </div>
          <div className="input slider_container">
              Thermal Diffusivity<br/>
              <input
                type="range"
                min="1"
                max="20"
                defaultValue={alpha/50}
                onChange={handleSetAlpha}
              /><br/>{alpha}
          </div>
      </div>

      <div ref={flagRef} className="plot_container">
          <Plot
              onRelayout={handleRelayout}
              style={{
                border: `1px solid ${borderColor}`,
                transition: 'border 1s'
              }}
              data={data}
              layout={layout}
              config={{ displayModeBar: false }}
          />
      </div>
      <div className="input_container">
          <div className="input">
              <button className="button" onClick={handleResetCamera}>Reset Camera</button><br/>
          </div>
      </div>

      <div style={{margin: '10%'}}></div>
    </div>
  )
}

export default HeatFlow