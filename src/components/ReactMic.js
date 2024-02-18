import React, { useRef, useEffect, useState } from 'react';
import { string, number, bool, func } from 'prop-types';
import { MicrophoneRecorder } from '../libs/MicrophoneRecorder';
import AudioPlayer from '../libs/AudioPlayer';
import Visualizer from '../libs/Visualizer';

const ReactMic = ({
  backgroundColor,
  strokeColor,
  className,
  audioBitsPerSecond,
  mimeType,
  width,
  height,
  visualSetting,
  echoCancellation,
  autoGainControl,
  noiseSuppression,
  channelCount,
  record,
  onStop,
  onData,
  onSave
}) => {
  const visualizerRef = useRef(null);
  const [microphoneRecorder, setMicrophoneRecorder] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [canvasCtx, setCanvasCtx] = useState(null);

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const options = { audioBitsPerSecond, mimeType };
        const soundOptions = { echoCancellation, autoGainControl, noiseSuppression };

        const audioElem = null; // Assuming no audio element is provided

        if (audioElem) {
          AudioPlayer.create(audioElem);
          setCanvas(visualizerRef.current);
          setCanvasCtx(visualizerRef.current.getContext('2d'));
        } else {
          setMicrophoneRecorder(new MicrophoneRecorder(onStart, onStop, onSave, onData, options, soundOptions));
          setCanvas(visualizerRef.current);
          setCanvasCtx(visualizerRef.current.getContext('2d'));
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    if (record) {
      initializeRecorder();
    } else {
      if (microphoneRecorder) {
        microphoneRecorder.stopRecording(onStop);
        clear();
      }
    }

    return () => {
      if (microphoneRecorder) {
        microphoneRecorder.stopRecording(onStop);
        clear();
      }
    };
  }, [record]);

  const visualize = () => {
    if (visualSetting === 'sinewave') {
      Visualizer.visualizeSineWave(canvasCtx, canvas, width, height, backgroundColor, strokeColor);
    } else if (visualSetting === 'frequencyBars') {
      Visualizer.visualizeFrequencyBars(canvasCtx, canvas, width, height, backgroundColor, strokeColor);
    } else if (visualSetting === 'frequencyCircles') {
      Visualizer.visualizeFrequencyCircles(canvasCtx, canvas, width, height, backgroundColor, strokeColor);
    }
  };

  const clear = () => {
    canvasCtx.clearRect(0, 0, width, height);
  };

  return <canvas ref={visualizerRef} height={height} width={width} className={className} />;
};

ReactMic.propTypes = {
  backgroundColor: string,
  strokeColor: string,
  className: string,
  audioBitsPerSecond: number,
  mimeType: string,
  height: number,
  record: bool.isRequired,
  onStop: func,
  onData: func,
  onSave: func,
  visualSetting: string,
  echoCancellation: bool,
  autoGainControl: bool,
  noiseSuppression: bool,
  channelCount: number
};

ReactMic.defaultProps = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  strokeColor: '#000000',
  className: 'visualizer',
  audioBitsPerSecond: 128000,
  mimeType: 'audio/webm;codecs=opus',
  width: 640,
  height: 100,
  visualSetting: 'sinewave',
  echoCancellation: false,
  autoGainControl: false,
  noiseSuppression: false,
  channelCount: 2
};

export default ReactMic;
