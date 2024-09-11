import React, { useEffect, useRef, useState } from 'react'
import './Canvas.css'
import getHexColor from './../helper_functions/ValueToHexColor'

const Canvas = (props) => {
    const WHITE_BACKGROUND = '#FAFAFA';
    const WHITE_BORDER = '#F0F0F0';
    const BLACK_BACKGROUND = '#0A0A0A';
    const BLACK_BORDER = '#0F0F0F';
    const MAX_LENGTH = 600;
    const MIN_LENGHT = 100;
    const canvasRef = useRef(null);
    const canvasSize = useRef(600);
    const numBlocks = useRef(40);
    const tempArr = useRef([]);
    const mouseDown = useRef(false);
    const updateSize = useRef(false);
    const backgroundColor = useRef(WHITE_BACKGROUND);
    const [borderColor, setBorderColor] = useState(BLACK_BORDER);

    function f(x) {
        return 0.42*(Math.sin(Math.PI*x/95)-Math.sin(Math.PI*2*x/100)+0.5);
    }
    function resetTemp() {
        tempArr.current = new Array(numBlocks.current);
        for (var i = 0; i < numBlocks.current; i++) {
            tempArr.current[i] = f(100*i/numBlocks.current);
        }
    }

    // Init
    useEffect(() => {
        resetTemp();

        document.addEventListener('visibilitychange', render);
        window.addEventListener('resize', handleResize);

        handleResize();
        props.recvTemp(tempArr.current);
    }, []);
    // Reset Handler
    const isInitialReset = useRef(true);
    useEffect(() => {
        if (isInitialReset.current) { isInitialReset.current = false; }
        else {
            reset();
            props.recvTemp(tempArr.current);
        }
    }, [props.reset]);
    // Change Block Count Handler
    const isInitialBlocks = useRef(true);
    useEffect(() => {
        if (isInitialBlocks.current) { isInitialBlocks.current = false; }
        else {
            updateSize.current = true;
            numBlocks.current = props.blocks;
            resetTemp()
            handleResize();
            props.recvTemp(tempArr.current);
        }
    }, [props.blocks]);
    // Ping Temperature Handler
    const isInitialPingTemp = useRef(true);
    useEffect(() => {
        if (isInitialPingTemp.current) { isInitialPingTemp.current = false; }
        else { props.recvTemp(tempArr.current); }
    }, [props.pingTemp]);
    // Dark Mode
    useEffect(() => {
        if (props.darkMode) {
            backgroundColor.current = BLACK_BACKGROUND;
            setBorderColor(WHITE_BORDER);
        } else {
            backgroundColor.current = WHITE_BACKGROUND;
            setBorderColor(BLACK_BORDER);
        }
        render();
    }, [props.darkMode]);

    // make 2 handle resizes
    const handleResize = () => {
        let canvas_outline = Math.floor(0.8*Math.min(window.innerWidth, window.innerHeight));
        canvas_outline = Math.round(Math.max(canvas_outline, MIN_LENGHT));
        canvas_outline = Math.round(Math.min(canvas_outline, MAX_LENGTH));
        let padding = canvas_outline % numBlocks.current;
        canvas_outline = canvas_outline - padding;
        if (
            Math.round(canvas_outline) !== Math.round(canvasSize.current) ||
            updateSize.current || true
        ) {
            updateSize.current = false;
            canvasSize.current = canvas_outline;
            render();
        }
    };
    function reset() {
        resetTemp()
        render();
    }
    function render() {
        const canvas = canvasRef.current;
        canvas.width = canvasSize.current;
        canvas.height = canvasSize.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor.current;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let dx = canvasSize.current / numBlocks.current;
        for (var i = 0; i < numBlocks.current; i++) {
            ctx.fillStyle = getHexColor(tempArr.current[i]);
            let y = tempArr.current[i];
            draw(i*dx, y*canvasSize.current);
        }
    }

    function draw(x, y_temp) {
        x = Math.max(Math.min(x, canvasSize.current - 1), 0);
        let dx = canvasSize.current / numBlocks.current;
        let y = Math.min(y_temp, canvasSize.current - dx/2) - dx/2;
        y = Math.round(Math.max(y, 0));

        let ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = backgroundColor.current;
        ctx.fillRect(x-x%dx, 0, dx, canvasSize.current);
      
        ctx.fillStyle = getHexColor(y/canvasSize.current);
        ctx.fillRect(x-x%dx, y, dx, dx);
        tempArr.current[(x-x%dx)/dx] = y_temp / canvasSize.current;
    }

    function getMousePos(evt) {
        var rect = canvasRef.current.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    function onCanvasMouseDown(evt) {
        mouseDown.current = true;
        var pos = getMousePos(evt);
        draw(pos.x, pos.y);
    }
    function onCanvasMouseUp() {
        mouseDown.current = false;
        props.recvTemp(tempArr.current);
    }
    function onCanvasMouseMove(evt) {
        if (mouseDown.current) {
            var pos = getMousePos(evt);
            draw(pos.x, pos.y);
        }
    }
    function onCanvasMouseLeave() {
        if (mouseDown.current) {
            mouseDown.current = false;
            props.recvTemp(tempArr.current);
        }
    }

  return (
    <div>
        {/* style={{margin:'0%', justifyContent: 'center', alignItems: 'center'}} */}
        <h1 className='canvas_title'>Draw Here</h1>
        <canvas
            ref={canvasRef}
            className='canvas'
            style={{border: `1px solid ${borderColor}`}}

            onMouseDown={onCanvasMouseDown}
            onMouseMove={onCanvasMouseMove}
            onMouseUp={onCanvasMouseUp}
            onMouseLeave={onCanvasMouseLeave}
        />
    </div>
  )
}

export default Canvas