import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const sectionRefs = useRef([]);
  const [initialized, setInitialized] = useState(false);

  // Collect references to each section element
  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // Wrap the animation initialization in a useCallback to satisfy ESLint
  const initAnimations = useCallback(() => {
    if (!initialized && window.gsap && window.ScrollTrigger) {
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);

      // Animate each section's text with a timeline
      sectionRefs.current.forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        });

        // First animation: Text enters from the left
        tl.fromTo(
          el.querySelector('.text'),
          { x: '-100%', autoAlpha: 0 },
          { x: '0%', autoAlpha: 1, duration: 1 }
        );

        // Second animation: Text exits to the right
        tl.to(
          el.querySelector('.text'),
          { x: '100%', autoAlpha: 0, duration: 1 }
        );
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
        <meta name="description" content="GSAP scroll animation demo in one file" />
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

      <div className="container">
        <header className="header">
          <h2>Scroll Animmmmmation Demo</h2>
        </header>
        <main className="main">
          <section className="section" ref={addToRefs}>
            <div className="text">
              <h1>Hello, I&apos;m Your Name!</h1>
            </div>
          </section>
          <section className="section" ref={addToRefs}>
            <div className="text">
              <p>
                This is my interactive website. Scroll down to see the text animate from left to right!
              </p>
            </div>
          </section>
          <section className="section" ref={addToRefs}>
            <div className="text">
              <p>
                Enjoy the animation as the text slides in and then exits smoothly.
              </p>
            </div>
          </section>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Your Name. All rights reserved.</p>
        </footer>
      </div>

      {/* Styled-JSX for component-specific styles */}
      <style jsx>{`
        .container {
          font-family: Arial, sans-serif;
        }
        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: #fff;
          z-index: 1000;
          padding: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .main {
          padding-top: 60px;
        }
        .section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .text {
          width: 100%;
          text-align: center;
        }
        .footer {
          min-height: 50px;
          text-align: center;
          padding: 20px;
          background: #f1f1f1;
        }
      `}</style>
    </>
  );
}
