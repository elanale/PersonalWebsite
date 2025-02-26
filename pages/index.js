import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import styles from '../styles/Home.module.css'; // Import the CSS module

export default function Home() {
  const sectionRefs = useRef([]);
  const [initialized, setInitialized] = useState(false);

  // Collect references to each section element
  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // Initialize GSAP animations
  const initAnimations = useCallback(() => {
    if (!initialized && window.gsap && window.ScrollTrigger) {
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);

      sectionRefs.current.forEach((el, index, arr) => {
        const isLast = index === arr.length - 1;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
          },
        });

        // Select the element to animate
        const textElement = el.querySelector(`.${styles.text}`);

        // Optimize rendering
        tl.set(textElement, { willChange: 'transform, opacity' });

        if (isLast) {
          // For the last box, animate from bottom to center (no exit tween)
          tl.fromTo(
            textElement,
            { y: '100%', autoAlpha: 0 },
            {
              y: '0%',
              autoAlpha: 1,
              duration: 1,
              ease: 'power2.out',
              immediateRender: false,
            }
          );
        } else {
          // For alternating boxes:
          if (index % 2 === 0) {
            // Even index: Animate from left to center, then exit to right
            tl.fromTo(
              textElement,
              { x: '-100%', autoAlpha: 0 },
              {
                x: '0%',
                autoAlpha: 1,
                duration: 1,
                ease: 'power2.out',
                immediateRender: false,
              }
            );
            tl.to(textElement, {
              x: '100%',
              autoAlpha: 0,
              duration: 1,
              ease: 'power2.in',
              immediateRender: false,
            });
          } else {
            // Odd index: Animate from right to center, then exit to left
            tl.fromTo(
              textElement,
              { x: '100%', autoAlpha: 0 },
              {
                x: '0%',
                autoAlpha: 1,
                duration: 1,
                ease: 'power2.out',
                immediateRender: false,
              }
            );
            tl.to(textElement, {
              x: '-100%',
              autoAlpha: 0,
              duration: 1,
              ease: 'power2.in',
              immediateRender: false,
            });
          }
        }
      });

      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      initAnimations();
    }
  }, [initAnimations]);

  return (
    <>
      <Head>
        <title>Scroll Animation Example</title>
        <meta name="description" content="GSAP scroll animation with Next.js" />
      </Head>
      {/* Load GSAP and ScrollTrigger via CDN */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/gsap.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/ScrollTrigger.min.js"
        strategy="afterInteractive"
        onLoad={initAnimations}
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <h2>David Elan Wygodski</h2>
        </header>
        <main className={styles.main}>
          <section className={styles.section} ref={addToRefs}>
            <div className={styles.text}>
              <h1>Welcome to...</h1>
            </div>
          </section>

          <section className={styles.section} ref={addToRefs}>
            <div className={styles.text}>
              <h1>My Webpage...</h1>
            </div>
          </section>
          
          <section className={styles.section} ref={addToRefs}>
            <div className={styles.text}>
              <h1>
                where you will find my projects and skills...
              </h1>
            </div>
          </section>

          {/* Last box: Animates from bottom to center */}
          <section
            className={`${styles.section} ${styles.lastSection}`}
            ref={addToRefs}
          >
            <div className={styles.text}>
              <h1>Explore Now</h1>
            </div>
          </section>
        </main>
        <footer className={styles.footer}>
          <p>
            &copy; {new Date().getFullYear()} David Elan Wygodski || All rights reserved
          </p>
        </footer>
      </div>
    </>
  );
}
