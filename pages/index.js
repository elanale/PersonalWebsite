import { useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const sectionRefs = useRef([]);

  // Collect references to each section element
  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  useEffect(() => {
    // Ensure GSAP and ScrollTrigger are loaded
    if (typeof window !== 'undefined' && window.gsap && window.ScrollTrigger) {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Animate each section's text with a timeline
      sectionRefs.current.forEach((el) => {
        // Create a timeline that will animate as you scroll through the section
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        });

        // First animation: Text enters from the left (from offscreen left to center)
        tl.fromTo(
          el.querySelector('.text'),
          { x: '-100%', autoAlpha: 0 },
          { x: '0%', autoAlpha: 1, duration: 1 }
        );

        // Second animation: As you scroll further, text exits to the right (from center to offscreen right)
        tl.to(
          el.querySelector('.text'),
          { x: '100%', autoAlpha: 0, duration: 1 }
        );
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Scroll Animation Example</title>
        <meta name="description" content="GSAP scroll animation demo in one file" />
      </Head>
      {/* Load GSAP and ScrollTrigger */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/gsap.min.js" 
        strategy="afterInteractive" 
      />
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/ScrollTrigger.min.js" 
        strategy="afterInteractive" 
      />

      <div className="container">
        <header className="header">
          <h2>Elan Wygodski</h2>
        </header>
        <main className="main">
          <section className="section" ref={addToRefs}>
            <div className="text">
              <h1>Hello</h1>
            </div>
          </section>
          <section className="section" ref={addToRefs}>
            <div className="text">
              <p>
                This is my interactive personal website!
              </p>
            </div>
          </section>
          <section className="section" ref={addToRefs}>
            <div className="text">
              <p>
                Full Website coming soon!
              </p>
            </div>
          </section>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Elan Wygodski. All rights reserved.</p>
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
