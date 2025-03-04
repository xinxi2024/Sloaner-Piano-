"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

// Define piano key types and their properties
interface PianoKey {
  note: string
  keyboardKey: string
  isBlack: boolean
  octave: number
}

// Define the piano keys layout - ensure we have a complete set of keys
const createPianoKeys = (): PianoKey[] => {
  // Create a full 2-octave keyboard (24 keys) plus the final C
  const octaves = 2
  const keys: PianoKey[] = []

  // Define keyboard mapping for first octave
  const firstOctaveKeys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"]

  // Define keyboard mapping for second octave
  const secondOctaveKeys = ["k", "o", "l", "p", ";", "'", "]", "\\", "z", "x", "c", "v"]

  const notesPerOctave = [
    { note: "C", isBlack: false },
    { note: "C#", isBlack: true },
    { note: "D", isBlack: false },
    { note: "D#", isBlack: true },
    { note: "E", isBlack: false },
    { note: "F", isBlack: false },
    { note: "F#", isBlack: true },
    { note: "G", isBlack: false },
    { note: "G#", isBlack: true },
    { note: "A", isBlack: false },
    { note: "A#", isBlack: true },
    { note: "B", isBlack: false },
  ]

  // Generate keys for each octave
  for (let octave = 0; octave < octaves; octave++) {
    notesPerOctave.forEach((noteInfo, index) => {
      const { note, isBlack } = noteInfo
      // Use the appropriate keyboard key based on the octave
      const keyboardKey = octave === 0 ? firstOctaveKeys[index] : secondOctaveKeys[index]

      keys.push({
        note: `${note}${octave + 4}`, // Start from octave 4 (middle C area)
        isBlack,
        keyboardKey,
        octave: octave + 4,
      })
    })
  }

  // Add the extra C key at the end
  keys.push({
    note: `C${octaves + 4}`,
    isBlack: false,
    keyboardKey: "b", // Use 'b' for the final C
    octave: octaves + 4,
  })

  return keys
}

interface PianoKeyboardProps {
  instrument: string
}

export default function PianoKeyboard({ instrument }: PianoKeyboardProps) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const pianoKeys = createPianoKeys()
  const audioContext = useRef<AudioContext | null>(null)
  const soundBuffers = useRef<Map<string, AudioBuffer>>(new Map())
  const activeNotes = useRef<Map<string, { source: AudioBufferSourceNode; gain: GainNode }>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Initialize audio context and load sounds
  useEffect(() => {
    // Create audio context on first user interaction
    const handleFirstInteraction = () => {
      if (!audioContext.current) {
        audioContext.current = new AudioContext()
        loadSounds()
      }

      // Remove event listeners after first interaction
      window.removeEventListener("click", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
      window.removeEventListener("touchstart", handleFirstInteraction)
    }

    window.addEventListener("click", handleFirstInteraction)
    window.addEventListener("keydown", handleFirstInteraction)
    window.addEventListener("touchstart", handleFirstInteraction)

    return () => {
      window.removeEventListener("click", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
      window.removeEventListener("touchstart", handleFirstInteraction)
    }
  }, [])

  // Load sound samples for the selected instrument
  const loadSounds = async () => {
    if (!audioContext.current) return

    setIsLoading(true)
    soundBuffers.current.clear()

    const totalSounds = pianoKeys.length
    let loadedSounds = 0

    const loadPromises = pianoKeys.map(async (key) => {
      try {
        // In a real app, you would have actual sound files for each note and instrument
        // For this demo, we'll use a synthesized tone
        const noteFrequency = getNoteFrequency(key.note)
        const buffer = await createToneBuffer(audioContext.current!, noteFrequency, instrument)
        soundBuffers.current.set(key.note, buffer)

        loadedSounds++
        setLoadingProgress(Math.floor((loadedSounds / totalSounds) * 100))
      } catch (error) {
        console.error(`Failed to load sound for ${key.note}:`, error)
      }
    })

    await Promise.all(loadPromises)
    setIsLoading(false)
  }

  // Reload sounds when instrument changes
  useEffect(() => {
    if (audioContext.current) {
      loadSounds()
    }
  }, [audioContext]) //Corrected dependency

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return // Prevent key repeat

      const key = e.key.toLowerCase()
      const pianoKey = pianoKeys.find((k) => k.keyboardKey === key)

      if (pianoKey) {
        playNote(pianoKey.note)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const pianoKey = pianoKeys.find((k) => k.keyboardKey === key)

      if (pianoKey) {
        stopNote(pianoKey.note)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [pianoKeys])

  // Play a note
  const playNote = (note: string) => {
    if (!audioContext.current || !soundBuffers.current.has(note)) return

    // Stop the note if it's already playing
    stopNote(note)

    // Create a new source and gain node
    const source = audioContext.current.createBufferSource()
    const gainNode = audioContext.current.createGain()

    source.buffer = soundBuffers.current.get(note)!
    source.connect(gainNode)
    gainNode.connect(audioContext.current.destination)

    source.start()

    // Store the active note
    activeNotes.current.set(note, { source, gain: gainNode })

    // Update UI
    setActiveKeys((prev) => {
      const updated = new Set(prev)
      updated.add(note)
      return updated
    })
  }

  // Stop a note
  const stopNote = (note: string) => {
    const activeNote = activeNotes.current.get(note)

    if (activeNote) {
      const { gain } = activeNote

      // Apply a quick fade out to avoid clicks
      const now = audioContext.current!.currentTime
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

      // Schedule the actual stop slightly later
      setTimeout(() => {
        try {
          activeNote.source.stop()
        } catch (e) {
          // Ignore errors if the source has already stopped
        }
        activeNotes.current.delete(note)
      }, 50)

      // Update UI immediately
      setActiveKeys((prev) => {
        const updated = new Set(prev)
        updated.delete(note)
        return updated
      })
    }
  }

  // Handle touch/mouse events
  const handleTouchStart = (note: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    playNote(note)
  }

  const handleTouchEnd = (note: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    stopNote(note)
  }

  // Calculate frequency for a given note
  const getNoteFrequency = (note: string): number => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const noteName = note.slice(0, -1)
    const octave = Number.parseInt(note.slice(-1))

    // A4 is 440Hz
    const A4 = 440
    const A4Index = notes.indexOf("A") + 4 * 12

    const noteIndex = notes.indexOf(noteName) + octave * 12
    const halfStepsFromA4 = noteIndex - A4Index

    return A4 * Math.pow(2, halfStepsFromA4 / 12)
  }

  // Create a synthetic tone buffer
  const createToneBuffer = async (
    context: AudioContext,
    frequency: number,
    instrumentType: string,
  ): Promise<AudioBuffer> => {
    const sampleRate = context.sampleRate
    const duration = 2.5 // seconds
    const bufferSize = sampleRate * duration
    const buffer = context.createBuffer(2, bufferSize, sampleRate)

    // Get the channel data
    const leftChannel = buffer.getChannelData(0)
    const rightChannel = buffer.getChannelData(1)

    // Different waveform generators based on instrument type
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate // time in seconds
      let sample = 0

      // Amplitude envelope
      const attackTime = 0.01
      const decayTime = 0.1
      const sustainLevel = 0.7
      const releaseTime = 1.5

      let envelope = 0
      if (t < attackTime) {
        envelope = t / attackTime // Attack phase
      } else if (t < attackTime + decayTime) {
        envelope = 1 - (1 - sustainLevel) * ((t - attackTime) / decayTime) // Decay phase
      } else if (t < duration - releaseTime) {
        envelope = sustainLevel // Sustain phase
      } else {
        envelope = sustainLevel * (1 - (t - (duration - releaseTime)) / releaseTime) // Release phase
      }

      switch (instrumentType) {
        case "piano":
          // Piano-like sound (mix of sine waves with harmonics)
          sample = Math.sin(2 * Math.PI * frequency * t) // Fundamental
          sample += 0.5 * Math.sin(2 * Math.PI * frequency * 2 * t) * Math.exp(-t * 2) // 2nd harmonic
          sample += 0.25 * Math.sin(2 * Math.PI * frequency * 3 * t) * Math.exp(-t * 3) // 3rd harmonic
          sample *= envelope * Math.exp(-t * 2) // Envelope with decay
          break

        case "organ":
          // Organ-like sound (rich in harmonics with sustained tone)
          sample = Math.sin(2 * Math.PI * frequency * t) // Fundamental
          sample += 0.5 * Math.sin(2 * Math.PI * frequency * 2 * t) // 2nd harmonic
          sample += 0.33 * Math.sin(2 * Math.PI * frequency * 3 * t) // 3rd harmonic
          sample += 0.25 * Math.sin(2 * Math.PI * frequency * 4 * t) // 4th harmonic
          sample *= envelope // Envelope with longer sustain
          break

        case "synth":
          // Synthesizer sound (sawtooth wave with filter sweep)
          // Sawtooth wave
          for (let j = 1; j <= 10; j++) {
            sample += Math.sin(2 * Math.PI * frequency * j * t) / j
          }
          // Add filter sweep effect
          const filterSweep = 1 - Math.exp(-t * 3)
          sample *= envelope * filterSweep
          break

        case "music-box":
          // Music box (pure sine with fast decay)
          sample = Math.sin(2 * Math.PI * frequency * t)
          sample += 0.1 * Math.sin(2 * Math.PI * frequency * 2.01 * t) // Slightly detuned harmonic for shimmer
          sample *= envelope * Math.exp(-t * 5) // Fast decay
          break

        default:
          // Default to piano
          sample = Math.sin(2 * Math.PI * frequency * t)
          sample *= envelope * Math.exp(-t * 2)
      }

      // Apply a slight stereo effect
      const stereoOffset = Math.sin(frequency / 100)
      leftChannel[i] = sample * (1 - Math.max(0, stereoOffset) * 0.2)
      rightChannel[i] = sample * (1 - Math.max(0, -stereoOffset) * 0.2)
    }

    return buffer
  }

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 text-white">
        <div className="text-xl mb-4 font-light">Loading sounds...</div>
        <div className="w-full max-w-md bg-indigo-700/30 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <div className="mt-2">{loadingProgress}%</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl overflow-x-auto py-6">
      <div className="piano-container relative min-w-[700px] mx-auto">
        {/* Piano top */}
        <div className="h-10 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg shadow-lg flex items-center px-4">
          <div className="text-xs text-gray-400 font-light">Sloaner Grand Piano</div>
          <div className="ml-auto flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            ))}
          </div>
        </div>

        {/* White keys */}
        <div className="flex relative">
          {pianoKeys
            .filter((key) => !key.isBlack)
            .map((key) => (
              <div
                key={key.note}
                className={cn(
                  "white-key relative bg-gradient-to-b from-gray-100 to-white border border-gray-300 rounded-b-md h-44 w-14 flex items-end justify-center pb-2 select-none transition-all duration-100 shadow-md",
                  activeKeys.has(key.note) &&
                    "bg-gradient-to-b from-indigo-100 to-indigo-200 border-indigo-300 transform translate-y-1 shadow-inner",
                )}
                onMouseDown={handleTouchStart(key.note)}
                onMouseUp={handleTouchEnd(key.note)}
                onMouseLeave={handleTouchEnd(key.note)}
                onTouchStart={handleTouchStart(key.note)}
                onTouchEnd={handleTouchEnd(key.note)}
              >
                <span className="text-gray-500 text-xs font-medium">
                  {key.keyboardKey && key.keyboardKey.toUpperCase()}
                </span>
              </div>
            ))}
        </div>

        {/* Black keys */}
        <div className="absolute top-10 left-0 flex">
          {pianoKeys.map((key, index) => {
            if (!key.isBlack) return null

            // Calculate position based on the white keys
            const whiteKeysBefore = pianoKeys.filter((k, i) => !k.isBlack && i < index).length

            return (
              <div
                key={key.note}
                className={cn(
                  "black-key absolute bg-gradient-to-b from-gray-900 to-gray-800 border-x border-b border-gray-700 rounded-b-md h-28 w-8 flex items-end justify-center pb-2 select-none z-10 transition-all duration-100 shadow-lg",
                  activeKeys.has(key.note) &&
                    "bg-gradient-to-b from-gray-800 to-gray-700 border-gray-600 transform translate-y-1 shadow-inner",
                )}
                style={{ left: `${whiteKeysBefore * 3.5 - 1}rem` }}
                onMouseDown={handleTouchStart(key.note)}
                onMouseUp={handleTouchEnd(key.note)}
                onMouseLeave={handleTouchEnd(key.note)}
                onTouchStart={handleTouchStart(key.note)}
                onTouchEnd={handleTouchEnd(key.note)}
              >
                <span className="text-gray-400 text-xs font-medium">
                  {key.keyboardKey && key.keyboardKey.toUpperCase()}
                </span>
              </div>
            )
          })}
        </div>

        {/* Piano bottom */}
        <div className="h-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-b-lg mt-[-4px] shadow-lg flex items-center justify-center">
          <div className="w-20 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </div>

      {/* Keyboard mapping guide */}
      <div className="mt-6 bg-white/5 backdrop-blur-sm p-3 rounded-lg text-white text-xs text-center max-w-2xl mx-auto">
        <div className="font-medium mb-1">Keyboard Mapping</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-indigo-300">First Octave:</span> A W S E D F T G Y H U J
          </div>
          <div>
            <span className="text-indigo-300">Second Octave:</span> K O L P ; ' ] \ Z X C V
          </div>
        </div>
      </div>
    </div>
  )
}

