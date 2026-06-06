import '@livekit/components-styles';
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  VideoConference,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';

interface BroadcastRoomProps {
  token: string;
  serverUrl: string;
  onDisconnected?: () => void;
}

function ConnectionStatus() {
  const room = useRoomContext();
  const state = room.state;

  if (state === ConnectionState.Connected) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        zIndex: 10,
        color: '#fff',
      }}
    >
      {state === ConnectionState.Connecting ? 'Connecting…' : 'Reconnecting…'}
    </div>
  );
}

export function BroadcastRoom({
  token,
  serverUrl,
  onDisconnected,
}: BroadcastRoomProps) {
  return (
    <div className="video-stage" style={{ position: 'relative' }}>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect
        video
        audio
        onDisconnected={onDisconnected}
        style={{ height: '100%' }}
      >
        <ConnectionStatus />
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

export function ViewerRoom({
  token,
  serverUrl,
  onDisconnected,
}: BroadcastRoomProps) {
  return (
    <div className="video-stage viewer-grid" style={{ position: 'relative' }}>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect
        video={false}
        audio={false}
        onDisconnected={onDisconnected}
        style={{ height: '100%' }}
      >
        <ConnectionStatus />
        <ViewerGrid />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

function ViewerGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  );

  return (
    <GridLayout tracks={tracks} style={{ height: '100%' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
