import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'VoiceAI Space - Voice AI Jobs, Events & Products'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 20 }}>
          VoiceAI Space
        </div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>
          Your Gateway to the Voice AI Revolution
        </div>
        <div style={{ fontSize: 24, marginTop: 30, opacity: 0.7 }}>
          Jobs • Events • Products
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}