import * as React from 'react';
import { HubGetSpawnProgress } from './HubCalls';

export type SpawnProgress = {
  percentComplete: number;
  messages: string[];
  lastMessage: string;
  failed: boolean;
  ready: boolean;
};

const initialProgress: SpawnProgress = {
  percentComplete: 0,
  messages: [],
  lastMessage: '',
  failed: false,
  ready: false,
};

export const useWatchSpawnProgress = (watch: boolean): SpawnProgress => {
  const [spawnProgress, setSpawnProgress] = React.useState<SpawnProgress>(initialProgress);
  const progressSource = React.useRef<EventSource>();

  React.useEffect(() => {
    if (watch) {
      try {
        progressSource.current = HubGetSpawnProgress();
        setSpawnProgress(initialProgress);
        progressSource.current.onmessage = (event) => {
          try {
            const eventData = JSON.parse(event.data);
            setSpawnProgress((progress) => ({
              percentComplete: eventData.progress,
              messages: [...(progress?.messages || []), eventData.message],
              lastMessage: eventData.message,
              failed: eventData.failed,
              ready: eventData.ready,
            }));
            if (eventData.failed || eventData.ready) {
              progressSource.current?.close();
            }
          } catch (e) {
            console.log(`Error onmessage: `, e);
          }
        };
      } catch (e) {
        console.log(`Error initializing progress watching: `, e);
      }
    }
    return () => {
      progressSource.current?.close();
    };
  }, [watch]);

  return spawnProgress;
};
