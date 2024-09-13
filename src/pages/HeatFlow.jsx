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
      <div className="name_container">
        <p className="name_paragraph">Boris Jancic</p>
        <a href="https://github.com/BorisJancic/Heat-Equation" target="_blank" className="github_link">
          {!darkMode && <svg viewBox="0 0 64 64" width="48px" height="48px"><path d="M 32 10 C 19.85 10 10 19.85 10 32 C 10 44.15 19.85 54 32 54 C 44.15 54 54 44.15 54 32 C 54 19.85 44.15 10 32 10 z M 32 14 C 41.941 14 50 22.059 50 32 C 50 40.238706 44.458716 47.16934 36.904297 49.306641 C 36.811496 49.1154 36.747844 48.905917 36.753906 48.667969 C 36.784906 47.458969 36.753906 44.637563 36.753906 43.601562 C 36.753906 41.823563 35.628906 40.5625 35.628906 40.5625 C 35.628906 40.5625 44.453125 40.662094 44.453125 31.246094 C 44.453125 27.613094 42.554688 25.720703 42.554688 25.720703 C 42.554688 25.720703 43.551984 21.842266 42.208984 20.197266 C 40.703984 20.034266 38.008422 21.634812 36.857422 22.382812 C 36.857422 22.382813 35.034 21.634766 32 21.634766 C 28.966 21.634766 27.142578 22.382812 27.142578 22.382812 C 25.991578 21.634813 23.296016 20.035266 21.791016 20.197266 C 20.449016 21.842266 21.445312 25.720703 21.445312 25.720703 C 21.445312 25.720703 19.546875 27.611141 19.546875 31.244141 C 19.546875 40.660141 28.371094 40.5625 28.371094 40.5625 C 28.371094 40.5625 27.366329 41.706312 27.265625 43.345703 C 26.675939 43.553637 25.872132 43.798828 25.105469 43.798828 C 23.255469 43.798828 21.849984 42.001922 21.333984 41.169922 C 20.825984 40.348922 19.7845 39.660156 18.8125 39.660156 C 18.1725 39.660156 17.859375 39.981656 17.859375 40.347656 C 17.859375 40.713656 18.757609 40.968484 19.349609 41.646484 C 20.597609 43.076484 20.574484 46.292969 25.021484 46.292969 C 25.547281 46.292969 26.492043 46.171872 27.246094 46.068359 C 27.241926 47.077908 27.230199 48.046135 27.246094 48.666016 C 27.251958 48.904708 27.187126 49.114952 27.09375 49.306641 C 19.540258 47.168741 14 40.238046 14 32 C 14 22.059 22.059 14 32 14 z" fill="#222222"/></svg>}
          {darkMode && <svg viewBox="0 0 64 64" width="48px" height="48px"><path d="M 32 10 C 19.85 10 10 19.85 10 32 C 10 44.15 19.85 54 32 54 C 44.15 54 54 44.15 54 32 C 54 19.85 44.15 10 32 10 z M 32 14 C 41.941 14 50 22.059 50 32 C 50 40.238706 44.458716 47.16934 36.904297 49.306641 C 36.811496 49.1154 36.747844 48.905917 36.753906 48.667969 C 36.784906 47.458969 36.753906 44.637563 36.753906 43.601562 C 36.753906 41.823563 35.628906 40.5625 35.628906 40.5625 C 35.628906 40.5625 44.453125 40.662094 44.453125 31.246094 C 44.453125 27.613094 42.554688 25.720703 42.554688 25.720703 C 42.554688 25.720703 43.551984 21.842266 42.208984 20.197266 C 40.703984 20.034266 38.008422 21.634812 36.857422 22.382812 C 36.857422 22.382813 35.034 21.634766 32 21.634766 C 28.966 21.634766 27.142578 22.382812 27.142578 22.382812 C 25.991578 21.634813 23.296016 20.035266 21.791016 20.197266 C 20.449016 21.842266 21.445312 25.720703 21.445312 25.720703 C 21.445312 25.720703 19.546875 27.611141 19.546875 31.244141 C 19.546875 40.660141 28.371094 40.5625 28.371094 40.5625 C 28.371094 40.5625 27.366329 41.706312 27.265625 43.345703 C 26.675939 43.553637 25.872132 43.798828 25.105469 43.798828 C 23.255469 43.798828 21.849984 42.001922 21.333984 41.169922 C 20.825984 40.348922 19.7845 39.660156 18.8125 39.660156 C 18.1725 39.660156 17.859375 39.981656 17.859375 40.347656 C 17.859375 40.713656 18.757609 40.968484 19.349609 41.646484 C 20.597609 43.076484 20.574484 46.292969 25.021484 46.292969 C 25.547281 46.292969 26.492043 46.171872 27.246094 46.068359 C 27.241926 47.077908 27.230199 48.046135 27.246094 48.666016 C 27.251958 48.904708 27.187126 49.114952 27.09375 49.306641 C 19.540258 47.168741 14 40.238046 14 32 C 14 22.059 22.059 14 32 14 z" fill="#eeeeee"/></svg>}
        </a>
      </div>
      <br/>

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