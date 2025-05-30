'use client'
import { usePlayer } from '@/context/PlayerContext'
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { IoMdShuffle, IoMdRepeat } from 'react-icons/io'
import Link from 'next/link'

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    setIsMuted
  } = usePlayer()

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const progressBarWidth = progressBar.clientWidth
    const clickPercentage = (clickPosition / progressBarWidth) * 100
    const audio = document.querySelector('audio')
    if (audio) {
      const newTime = (clickPercentage / 100) * audio.duration
      audio.currentTime = newTime
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value
    setVolume(newVolume)
    const audio = document.querySelector('audio')
    if (audio) {
      audio.volume = newVolume / 100
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = document.querySelector('audio')
    if (audio) {
      if (isMuted) {
        audio.volume = volume / 100
      } else {
        audio.volume = 0
      }
    }
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white h-20 z-50 flex items-center justify-center">
        <p>Загрузка плеера...</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white h-20 border-t border-gray-800 z-50">
      <div className="container mx-auto px-4 h-full flex items-center">
        <Link 
          href={`/tracks/${currentTrack._id}`}
          className="w-1/4 flex items-center hover:bg-gray-800 rounded p-2 transition-colors"
        >
          <div className="h-14 w-14 flex-shrink-0 mr-3">
            <img 
              src='/defaultcover.png'
              alt={currentTrack.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium truncate">{currentTrack.title}</h4>
            <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
        </Link>

        <div className="w-2/4 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-2">
            <button 
              onClick={prevTrack}
              className="text-gray-400 hover:text-white"
            >
              <FaStepBackward />
            </button>
            <button 
              onClick={togglePlay}
              className="bg-white text-black rounded-full h-8 w-8 flex items-center justify-center hover:scale-105"
            >
              {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
            </button>
            <button 
              onClick={nextTrack}
              className="text-gray-400 hover:text-white"
            >
              <FaStepForward />
            </button>
          </div>
          
          <div className="w-full flex items-center">
            <span className="text-xs text-gray-400 w-10">
              {formatTime((progress / 100) * (currentTrack.duration || 0))}
            </span>
            <div 
              className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer mx-2"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 w-10">
              {formatTime(currentTrack.duration || 0)}
            </span>
          </div>
        </div>

        <div className="w-1/4 flex justify-end">
          <div className="flex items-center space-x-2 w-24">
            <button 
              onClick={toggleMute}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}