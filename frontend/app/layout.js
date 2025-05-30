import { AuthProvider } from '../context/AuthContext'
import { WebSocketProvider } from '../context/WebSocketContext'
import { PlayerProvider } from '@/context/PlayerContext'
import './globals.css'
import Navbar from '@/components/common/Navbar'
import Player from '@/components/ui/Player'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-light text-text font-sans antialiased">
        <AuthProvider>
          <PlayerProvider>
          <WebSocketProvider>
            <Navbar />
            {children}
            <Player />
          </WebSocketProvider>
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

