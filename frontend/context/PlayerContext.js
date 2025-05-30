'use client'
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { TrackService } from '@/services/track'

const PlayerContext = createContext()

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [queue, setQueue] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)
  const progressInterval = useRef(null)

  useEffect(() => {
    const loadRandomTracks = async () => {
      try {
        const { data } = await TrackService.getRandom(5)
        if (data.length > 0) {
          setQueue(data)
          setCurrentTrack(data[0])
        }
      } catch (error) {
        console.error('Failed to load tracks:', error)
      }
    }

    loadRandomTracks()
  }, [])

  const togglePlay = () => {
    if (!currentTrack) return
    
    if (isPlaying) {
      audioRef.current.pause()
      clearInterval(progressInterval.current)
    } else {
      audioRef.current.play()
      startProgressTimer()
    }
    setIsPlaying(!isPlaying)
  }

  const startProgressTimer = () => {
    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100
        setProgress(newProgress)
      }
    }, 1000)
  }

  const nextTrack = () => {
    if (queue.length === 0) return
    
    const newIndex = (currentTrackIndex + 1) % queue.length
    setCurrentTrackIndex(newIndex)
    setCurrentTrack(queue[newIndex])
    setProgress(0)
    if (isPlaying) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  const prevTrack = () => {
    if (queue.length === 0) return
    
    const newIndex = (currentTrackIndex - 1 + queue.length) % queue.length
    setCurrentTrackIndex(newIndex)
    setCurrentTrack(queue[newIndex])
    setProgress(0)
    if (isPlaying) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  const playTrack = (track, tracks = []) => {
    if (tracks.length > 0) {
      setQueue(tracks)
      const newIndex = tracks.findIndex(t => t._id === track._id)
      setCurrentTrackIndex(newIndex >= 0 ? newIndex : 0)
    }
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        progress,
        volume,
        isMuted,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        setIsMuted
      }}
    >
      {children}
      {/* Скрытый аудио элемент */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        onEnded={nextTrack}
        onLoadedMetadata={() => {
          if (isPlaying) audioRef.current?.play()
        }}
      />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}