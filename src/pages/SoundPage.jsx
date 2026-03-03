import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_STATUS = 'カーソルをパレットに近づけると音が鳴り始めます。';
const PALETTE_RANGE = { min: 196, max: 880 };

const SOUND_PADS = [
  { label: 'きらめきベル', id: 'bell', start: '#ff9a9e', end: '#fad0c4' },
  { label: 'ふんわりハープ', id: 'pluck', start: '#a18cd1', end: '#fbc2eb' },
  { label: 'きゅいーんレーザー', id: 'laser', start: '#84fab0', end: '#8fd3f4' },
  { label: 'ココアドラム', id: 'drum', start: '#ffecd2', end: '#fcb69f' },
  { label: 'はじけるスパーク', id: 'sparkle', start: '#f6d365', end: '#fda085' },
  { label: 'ロボットトーク', id: 'robot', start: '#cfd9df', end: '#e2ebf0' },
  { label: '甘いハーモニー', id: 'chord', start: '#ffafbd', end: '#ffc3a0' },
  { label: 'そよかぜウーシュ', id: 'whoosh', start: '#a1c4fd', end: '#c2e9fb' },
  { label: 'ことことタイマー', id: 'clock', start: '#d4fc79', end: '#96e6a1' },
];

const PALETTE_MODES = [
  {
    name: 'ふわっとメジャー',
    intervals: [1, 5 / 4, 3 / 2],
    waveforms: ['triangle', 'sine', 'sine'],
    gains: [0.34, 0.26, 0.2],
  },
  {
    name: 'やさしいマイナー',
    intervals: [1, 6 / 5, 3 / 2],
    waveforms: ['sine', 'triangle', 'triangle'],
    gains: [0.32, 0.25, 0.18],
  },
  {
    name: 'きらめくドミナント',
    intervals: [1, 5 / 4, 7 / 4],
    waveforms: ['sawtooth', 'sine', 'triangle'],
    gains: [0.3, 0.24, 0.18],
  },
];

const KEYSTACKS = [
  { root: 'A', display: 'A', black: false },
  { root: 'A#', display: 'A♯', black: true },
  { root: 'B', display: 'B', black: false },
  { root: 'C', display: 'C', black: false },
  { root: 'C#', display: 'C♯', black: true },
  { root: 'D', display: 'D', black: false },
  { root: 'D#', display: 'D♯', black: true },
  { root: 'E', display: 'E', black: false },
  { root: 'F', display: 'F', black: false },
  { root: 'F#', display: 'F♯', black: true },
  { root: 'G', display: 'G', black: false },
  { root: 'G#', display: 'G♯', black: true },
];

const DIATONIC_GROUPS = [
  {
    title: 'Key of F',
    chords: [
      { root: 'F', display: 'F', quality: 'maj7' },
      { root: 'Bb', display: 'B♭', quality: 'maj7' },
      { root: 'C', display: 'C', quality: '7' },
      { root: 'G', display: 'G', quality: 'm7' },
      { root: 'A', display: 'A', quality: 'm7' },
      { root: 'D', display: 'D', quality: 'm7' },
      { root: 'E', display: 'E', quality: 'm7b5' },
    ],
  },
  {
    title: 'Key of C',
    chords: [
      { root: 'C', display: 'C', quality: 'maj7' },
      { root: 'F', display: 'F', quality: 'maj7' },
      { root: 'G', display: 'G', quality: '7' },
      { root: 'D', display: 'D', quality: 'm7' },
      { root: 'E', display: 'E', quality: 'm7' },
      { root: 'A', display: 'A', quality: 'm7' },
      { root: 'B', display: 'B', quality: 'm7b5' },
    ],
  },
  {
    title: 'Key of B♭',
    chords: [
      { root: 'Bb', display: 'B♭', quality: 'maj7' },
      { root: 'Eb', display: 'E♭', quality: 'maj7' },
      { root: 'F', display: 'F', quality: '7' },
      { root: 'C', display: 'C', quality: 'm7' },
      { root: 'D', display: 'D', quality: 'm7' },
      { root: 'G', display: 'G', quality: 'm7' },
      { root: 'A', display: 'A', quality: 'm7b5' },
    ],
  },
];

const QUALITY_INTERVALS = {
  maj7: [0, 4, 7, 11],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  triad: [0, 4, 7],
};

const NOTE_TO_MIDI = {
  A: 57,
  'A#': 58,
  Bb: 58,
  B: 59,
  C: 60,
  'C#': 61,
  Db: 61,
  D: 62,
  'D#': 63,
  Eb: 63,
  E: 64,
  F: 65,
  'F#': 66,
  Gb: 66,
  G: 67,
  'G#': 68,
  Ab: 68,
};

function createAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  return new AudioContextClass();
}

function playTone(audioCtx, options) {
  const {
    type = 'sine',
    frequency = 440,
    duration = 0.5,
    attack = 0.02,
    release = 0.2,
    gain = 0.5,
    detune = 0,
    startOffset = 0,
  } = options;

  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  const start = audioCtx.currentTime + startOffset;
  const end = start + duration;
  const sustainEnd = end - release;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (detune) {
    osc.detune.setValueAtTime(detune, start);
  }

  amp.gain.setValueAtTime(0, start);
  amp.gain.linearRampToValueAtTime(gain, start + attack);
  if (sustainEnd > start + attack) {
    amp.gain.linearRampToValueAtTime(gain * 0.7, sustainEnd);
  }
  amp.gain.linearRampToValueAtTime(0, end);

  osc.connect(amp).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(end + 0.05);
}

function playNoise(audioCtx, options) {
  const {
    duration = 0.6,
    filterFrequency = 1200,
    gain = 0.5,
    filterType = 'lowpass',
  } = options;

  const bufferSize = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFrequency;

  const amp = audioCtx.createGain();
  const now = audioCtx.currentTime;
  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(gain, now + 0.02);
  amp.gain.linearRampToValueAtTime(0, now + duration);

  noise.connect(filter).connect(amp).connect(audioCtx.destination);
  noise.start(now);
  noise.stop(now + duration + 0.05);
}

function playChord(audioCtx, rootFrequency) {
  const ratios = [1, 5 / 4, 3 / 2];
  ratios.forEach((ratio, index) => {
    playTone(audioCtx, {
      frequency: rootFrequency * ratio,
      duration: 1.2,
      attack: 0.05,
      release: 0.6,
      type: index === 0 ? 'triangle' : 'sine',
      gain: 0.35,
    });
  });
}

function playSparkle(audioCtx) {
  const base = audioCtx.currentTime;
  const sequence = [1046, 1245, 1480, 1661];
  sequence.forEach((freq, index) => {
    const delay = index * 0.08;
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, base + delay);
    amp.gain.setValueAtTime(0, base + delay);
    amp.gain.linearRampToValueAtTime(0.5, base + delay + 0.02);
    amp.gain.linearRampToValueAtTime(0, base + delay + 0.18);
    osc.connect(amp).connect(audioCtx.destination);
    osc.start(base + delay);
    osc.stop(base + delay + 0.2);
  });
}

function noteToFrequency(note) {
  const midi = NOTE_TO_MIDI[note];
  if (midi === undefined) {
    return 0;
  }
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playIntervals(audioCtx, root, intervals) {
  const rootFrequency = noteToFrequency(root);
  if (!rootFrequency) {
    return;
  }

  intervals.forEach((semitones, index) => {
    const frequency = rootFrequency * Math.pow(2, semitones / 12);
    playTone(audioCtx, {
      frequency,
      duration: 1.4,
      attack: 0.04,
      release: 0.7,
      type: index === 0 ? 'triangle' : 'sine',
      gain: index === 0 ? 0.32 : 0.22,
      startOffset: index * 0.01,
    });
  });
}

function frequencyToNote(frequency) {
  if (!Number.isFinite(frequency)) {
    return '';
  }
  const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const midi = Math.round(12 * Math.log2(frequency / 440) + 69);
  const name = noteNames[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

function chordLabel(display, quality) {
  if (quality === 'triad') {
    return `${display}トライアド`;
  }
  if (quality === 'm7b5') {
    return `${display}m7♭5`;
  }
  return `${display}${quality}`;
}

function playSoundById(audioCtx, soundId) {
  switch (soundId) {
    case 'bell':
      playTone(audioCtx, { frequency: 880, duration: 0.8, attack: 0.01, release: 0.5, type: 'sine', gain: 0.45 });
      playTone(audioCtx, { frequency: 1318, duration: 0.8, attack: 0.03, release: 0.5, type: 'triangle', gain: 0.3 });
      return;
    case 'pluck':
      playTone(audioCtx, { frequency: 523, duration: 0.5, attack: 0.005, release: 0.4, type: 'sawtooth', gain: 0.35 });
      playTone(audioCtx, { frequency: 784, duration: 0.4, attack: 0.01, release: 0.3, type: 'triangle', gain: 0.2 });
      return;
    case 'laser': {
      const osc = audioCtx.createOscillator();
      const amp = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);
      amp.gain.setValueAtTime(0, now);
      amp.gain.linearRampToValueAtTime(0.6, now + 0.05);
      amp.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(amp).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
      return;
    }
    case 'drum': {
      playNoise(audioCtx, { duration: 0.4, filterFrequency: 800, gain: 0.6 });
      const osc = audioCtx.createOscillator();
      const amp = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.4);
      amp.gain.setValueAtTime(0.6, now);
      amp.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(amp).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      return;
    }
    case 'sparkle':
      playSparkle(audioCtx);
      playNoise(audioCtx, { duration: 0.25, filterFrequency: 6000, gain: 0.2, filterType: 'highpass' });
      return;
    case 'robot': {
      const osc = audioCtx.createOscillator();
      const amp = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.2);
      osc.frequency.linearRampToValueAtTime(200, now + 0.4);
      amp.gain.setValueAtTime(0, now);
      amp.gain.linearRampToValueAtTime(0.5, now + 0.03);
      amp.gain.linearRampToValueAtTime(0, now + 0.45);
      osc.connect(amp).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      return;
    }
    case 'chord':
      playChord(audioCtx, 392);
      return;
    case 'whoosh': {
      playNoise(audioCtx, { duration: 0.7, filterFrequency: 900, gain: 0.4 });
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);
      const noiseSource = audioCtx.createBufferSource();
      const duration = 0.8;
      const bufferSize = Math.floor(audioCtx.sampleRate * duration);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = (Math.random() * 2 - 1) * 0.6;
      }
      noiseSource.buffer = buffer;
      const amp = audioCtx.createGain();
      const now = audioCtx.currentTime;
      amp.gain.setValueAtTime(0, now);
      amp.gain.linearRampToValueAtTime(0.5, now + 0.1);
      amp.gain.linearRampToValueAtTime(0, now + duration);
      noiseSource.connect(filter).connect(amp).connect(audioCtx.destination);
      filter.frequency.linearRampToValueAtTime(2000, now + duration);
      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.05);
      return;
    }
    case 'clock':
      [0, 0.25].forEach((offset) => {
        playTone(audioCtx, { frequency: 880, duration: 0.18, attack: 0.005, release: 0.12, type: 'triangle', gain: 0.4, startOffset: offset });
        playTone(audioCtx, { frequency: 660, duration: 0.16, attack: 0.005, release: 0.12, type: 'sine', gain: 0.3, startOffset: offset });
      });
      return;
    default:
  }
}

export default function SoundPage() {
  const [paletteStatus, setPaletteStatus] = useState(DEFAULT_STATUS);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });

  const audioContextRef = useRef(null);
  const paletteCanvasRef = useRef(null);
  const paletteNodesRef = useRef(null);
  const palettePointerRef = useRef(null);

  const getAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    const audioCtx = audioContextRef.current;
    if (!audioCtx) {
      return null;
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    return audioCtx;
  };

  const stopPaletteNodes = (immediate = false, resetPointer = true) => {
    const audioCtx = audioContextRef.current;
    const current = paletteNodesRef.current;
    if (!audioCtx || !current) {
      return;
    }
    const { baseGain, voices } = current;
    const now = audioCtx.currentTime;
    const release = immediate ? 0.08 : 0.2;

    baseGain.gain.cancelScheduledValues(now);
    baseGain.gain.linearRampToValueAtTime(0, now + release);
    voices.forEach(({ osc }) => {
      osc.stop(now + release + 0.05);
    });

    setTimeout(() => {
      voices.forEach(({ osc, gain }) => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // noop
        }
      });
      try {
        baseGain.disconnect();
      } catch {
        // noop
      }
    }, (release + 0.1) * 1000);

    paletteNodesRef.current = null;
    if (resetPointer) {
      palettePointerRef.current = null;
    }
  };

  const startPaletteNodes = (audioCtx, modeIndex, frequency) => {
    const mode = PALETTE_MODES[modeIndex];
    const now = audioCtx.currentTime;
    const baseGain = audioCtx.createGain();
    baseGain.gain.setValueAtTime(0, now);
    baseGain.connect(audioCtx.destination);

    const voices = mode.intervals.map((interval, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const waveform = mode.waveforms[index] || mode.waveforms[mode.waveforms.length - 1] || 'sine';
      const level = mode.gains[index] ?? 0.25;
      osc.type = waveform;
      osc.frequency.setValueAtTime(frequency * interval, now);
      gainNode.gain.setValueAtTime(level, now);
      osc.connect(gainNode).connect(baseGain);
      osc.start(now);
      return { osc, gain: gainNode, interval };
    });

    baseGain.gain.linearRampToValueAtTime(0.55, now + 0.15);
    paletteNodesRef.current = { modeIndex, baseGain, voices };
  };

  const updatePaletteNodes = (audioCtx, modeIndex, frequency) => {
    const current = paletteNodesRef.current;
    const now = audioCtx.currentTime;

    if (!current || current.modeIndex !== modeIndex) {
      stopPaletteNodes(true, false);
      startPaletteNodes(audioCtx, modeIndex, frequency);
      return;
    }

    current.voices.forEach(({ osc, interval }) => {
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setTargetAtTime(frequency * interval, now, 0.08);
    });
  };

  const handlePaletteInteraction = async (event) => {
    const audioCtx = await getAudioContext();
    if (!audioCtx || !paletteCanvasRef.current) {
      return;
    }

    const rect = paletteCanvasRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

    const xRatio = rect.width ? x / rect.width : 0;
    const yRatio = rect.height ? y / rect.height : 0;

    const frequency = PALETTE_RANGE.min + (PALETTE_RANGE.max - PALETTE_RANGE.min) * xRatio;
    const modeIndex = Math.min(PALETTE_MODES.length - 1, Math.max(0, Math.floor(yRatio * PALETTE_MODES.length)));

    updatePaletteNodes(audioCtx, modeIndex, frequency);

    const note = frequencyToNote(frequency);
    setPaletteStatus(`音の高さ: ${note} (${frequency.toFixed(0)}Hz) / ハーモニー: ${PALETTE_MODES[modeIndex].name}`);
    setCursor({ x, y, visible: true });
  };

  const endPaletteInteraction = (event) => {
    if (
      typeof event?.pointerId === 'number' &&
      event.currentTarget?.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    stopPaletteNodes(false, true);
    setCursor((current) => ({ ...current, visible: false }));
    setPaletteStatus(DEFAULT_STATUS);
  };

  const handleChordClick = async (root, quality) => {
    const audioCtx = await getAudioContext();
    if (!audioCtx) {
      return;
    }
    const intervals = QUALITY_INTERVALS[quality];
    if (intervals) {
      playIntervals(audioCtx, root, intervals);
    }
  };

  const handlePadClick = async (soundId) => {
    const audioCtx = await getAudioContext();
    if (!audioCtx) {
      return;
    }
    playSoundById(audioCtx, soundId);
  };

  useEffect(() => {
    return () => {
      stopPaletteNodes(true, true);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="sound-page">
      <main>
        <h1>サウンドパレット</h1>
        <p>9つのボタンをタップして、フィンちゃんのパン屋さんにぴったりなサウンドを鳴らしてみましょう！それぞれのボタンには異なる効果音を用意しました。</p>

        <div className="sound-grid">
          {SOUND_PADS.map((pad) => (
            <button
              className="sound-pad"
              key={pad.id}
              style={{ '--start': pad.start, '--end': pad.end }}
              onClick={() => handlePadClick(pad.id)}
            >
              {pad.label}
            </button>
          ))}
        </div>

        <section className="palette-section" aria-labelledby="mood-palette">
          <h2 id="mood-palette">ムードサウンドパレット</h2>
          <p>横軸は音の高低、縦軸は和音と音色の変化を表しています。ふわっと浮かぶメジャー、やさしいマイナー、きらめくドミナントなど、カーソルを当てる位置によって響きが変わる特別なパレットです。気分に合う場所を探しながら、滑らかに移り変わるサウンドを味わってください。</p>

          <div className="palette-area">
            <div
              className="palette-canvas"
              role="application"
              aria-describedby="palette-description"
              tabIndex={0}
              ref={paletteCanvasRef}
              onPointerEnter={async (event) => {
                palettePointerRef.current = event.pointerId;
                await handlePaletteInteraction(event);
              }}
              onPointerMove={async (event) => {
                if (palettePointerRef.current === null) {
                  palettePointerRef.current = event.pointerId;
                }
                if (palettePointerRef.current !== event.pointerId) {
                  return;
                }
                await handlePaletteInteraction(event);
              }}
              onPointerDown={async (event) => {
                palettePointerRef.current = event.pointerId;
                event.currentTarget.setPointerCapture(event.pointerId);
                await handlePaletteInteraction(event);
              }}
              onPointerUp={endPaletteInteraction}
              onPointerCancel={endPaletteInteraction}
              onPointerLeave={endPaletteInteraction}
              onBlur={endPaletteInteraction}
            >
              <div className="palette-grid" aria-hidden="true">
                {Array.from({ length: 36 }, (_, index) => (
                  <span key={index}></span>
                ))}
              </div>
              <div
                className={`palette-cursor ${cursor.visible ? '' : 'hidden'}`}
                style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
                aria-hidden="true"
              ></div>
            </div>

            <div className="palette-label palette-label-x" aria-hidden="true">
              <span>低い音</span>
              <span>音の高さ</span>
              <span>高い音</span>
            </div>
            <div className="palette-label palette-label-y-top" aria-hidden="true">華やかなハーモニー</div>
            <div className="palette-label palette-label-y-bottom" aria-hidden="true">あたたかい音色</div>
          </div>

          <p id="palette-description" className="palette-status" aria-live="polite">{paletteStatus}</p>
        </section>

        <section className="section" aria-labelledby="keyboard-section">
          <h2 id="keyboard-section">コードキーボード</h2>
          <p>ピアノの鍵盤のように並んだルート音から、お好みのコードクオリティを選んで鳴らしてみましょう。メジャーセブンス、セブンス、マイナーセブンス、マイナーセブンスフラット5、トライアドの響きを楽しめます。</p>

          <div className="keyboard-chords">
            {KEYSTACKS.map((keyData) => (
              <div className="key-stack" key={keyData.root}>
                <div className={`root-label ${keyData.black ? 'black' : ''}`}>{keyData.display}</div>
                {['maj7', '7', 'm7', 'm7b5', 'triad'].map((quality) => (
                  <button
                    className={`chord-button ${quality === '7' || quality === 'm7b5' ? 'alt' : ''}`}
                    key={quality}
                    onClick={() => handleChordClick(keyData.root, quality)}
                  >
                    {chordLabel(keyData.display, quality)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="section diatonic-section" aria-labelledby="diatonic-section">
          <h2 id="diatonic-section">ダイアトニックコード（F / C / B♭）</h2>
          <p>各キーごとにメジャー系からマイナー系へと並べたダイアトニックコードです。響きの移り変わりを順番に聴いてみましょう。</p>
          <div className="diatonic-groups">
            {DIATONIC_GROUPS.map((group) => (
              <div className="diatonic-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="diatonic-row">
                  {group.chords.map((chord) => (
                    <button
                      className={`chord-button ${chord.quality === '7' || chord.quality === 'm7b5' ? 'alt' : ''}`}
                      key={`${group.title}-${chord.display}-${chord.quality}`}
                      onClick={() => handleChordClick(chord.root, chord.quality)}
                    >
                      {chordLabel(chord.display, chord.quality)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Link className="back-link" to="/">← トップページへ戻る</Link>
      </main>
      <footer>© 2024 フィンちゃんのパン屋さん</footer>
    </div>
  );
}
