'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const taglines = [
  'Xhosa Hip Hop Vids🔥',
  'Bukela iiXHipHop Videos📺',
  'Jampa iiCats ezi Dope😎',
  'iVibe yase kasi🎵',
  'iCiko Lomculo lilapha 🤞🏽',
  'iiSpaza Gods zilapha 🙌🏽',
  'uManyoko ulapha 😎',
  'uGxeezy ulapha 🤯',
  'Rap Rapper Rappest 🎤',
];

export default function Home() {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTagline((prev) => (prev + 1) % taglines.length);
        setIsVisible(true);
      }, 500); // Wait for fade out before changing tagline
    }, 2500); // Change tagline every 4 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='min-h-screen flex flex-col bg-black text-white'>
      {/* <header className='absolute top-0 left-0 right-0 z-10'>
        <nav className='container mx-auto px-4 py-6 flex justify-between items-center'>
          <div className='flex items-center'>
            <Image
              src='/logo-white.png'
              alt='Xhosa Hip Hop Hub Logo'
              width={50}
              height={50}
              className='mr-4'
            />
            <span className='text-2xl font-bold text-red-600'>
              Xhosa Hip Hop Hub
            </span>
          </div>
          <ul className='flex space-x-6 text-lg font-semibold'>
            <li>
              <Link href='/' className='hover:text-red-600 transition-colors'>
                Home
              </Link>
            </li>
            <li>
              <Link
                href='/espazza'
                className='hover:text-red-600 transition-colors'
              >
                Espazza
              </Link>
            </li>
            <li>
              <Link
                href='/videos'
                className='hover:text-red-600 transition-colors'
              >
                Videos
              </Link>
            </li>
          </ul>
        </nav>
      </header> */}

      <main className='flex-grow'>
        <section className='relative h-screen flex items-center justify-center'>
          <Image
            src='/ndlu.jpg'
            alt='Xhosa hip hop background'
            fill
            priority
            className='object-cover'
            sizes='100vw'
          />
          <div className='absolute inset-0 bg-black bg-opacity-80'></div>
          <div className='relative z-10 text-center'>
            <Image
              src='/logo-white.png'
              alt='Xhosa Hip Hop Hub Logo'
              width={150}
              height={150}
              className='mx-auto mb-8'
            />
            <h1 className='text-5xl md:text-7xl font-bold mb-4 h-24 flex my-2 items-center justify-center'>
              <span
                className={`transition-opacity duration-500 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {taglines[currentTagline]}
              </span>
            </h1>
            <p className='text-xl md:text-2xl mb-8 animate-subtitle'>
              Watch and enjoy the ntswempest Xhosa hip hop music videos
            </p>
            <Link
              href='/videos'
              className='bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors animate-cta'
            >
              Start Streaming
            </Link>
          </div>
        </section>
      </main>

      <footer className='bg-black text-white py-6 border-t border-red-600'>
        <div className='container mx-auto px-4 text-center'>
          <p>
            &copy; {new Date().getFullYear()} Xhosa Hip Hop. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
