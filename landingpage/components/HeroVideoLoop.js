'use client';

import { useEffect, useRef } from 'react';
import styles from './HeroVideoLoop.module.css';

const CROSSFADE_SECONDS = 1;

export default function HeroVideoLoop({ src }) {
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const activeRef = useRef('a');
  const crossfadingRef = useRef(false);

  useEffect(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return undefined;

    const getPair = () =>
      activeRef.current === 'a'
        ? { active: videoA, next: videoB }
        : { active: videoB, next: videoA };

    const playSafely = (video) => {
      const promise = video.play();
      if (promise?.catch) promise.catch(() => {});
    };

    const resetVideo = (video) => {
      video.pause();
      video.currentTime = 0;
      video.style.opacity = '0';
    };

    const handleTimeUpdate = (event) => {
      const { active, next } = getPair();
      if (event.target !== active) return;

      const duration = active.duration;
      if (!duration || Number.isNaN(duration)) return;

      const fadeStart = Math.max(0, duration - CROSSFADE_SECONDS);
      const time = active.currentTime;

      if (time < fadeStart) {
        active.style.opacity = '1';
        if (!crossfadingRef.current) next.style.opacity = '0';
        return;
      }

      if (!crossfadingRef.current) {
        crossfadingRef.current = true;
        next.currentTime = 0;
        playSafely(next);
      }

      const progress = Math.min(1, (time - fadeStart) / CROSSFADE_SECONDS);
      active.style.opacity = String(1 - progress);
      next.style.opacity = String(progress);

      if (progress >= 0.995) {
        resetVideo(active);
        next.style.opacity = '1';
        activeRef.current = activeRef.current === 'a' ? 'b' : 'a';
        crossfadingRef.current = false;
      }
    };

    playSafely(videoA);

    videoA.addEventListener('timeupdate', handleTimeUpdate);
    videoB.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoA.removeEventListener('timeupdate', handleTimeUpdate);
      videoB.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const videoProps = {
    autoPlay: true,
    muted: true,
    playsInline: true,
    preload: 'auto',
    disablePictureInPicture: true,
  };

  return (
    <div className={styles.wrap}>
      <video ref={videoARef} className={styles.video} aria-hidden="true" {...videoProps}>
        <source src={src} type="video/mp4" />
      </video>
      <video ref={videoBRef} className={styles.video} aria-hidden="true" {...videoProps}>
        <source src={src} type="video/mp4" />
      </video>
      <div className={styles.edgeBlend} aria-hidden="true" />
    </div>
  );
}
