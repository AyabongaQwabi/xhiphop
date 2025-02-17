import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav className='bg-black shadow-xl fixed top-0 z-10 w-full border-b border-gray-800'>
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo Section */}
          <Link href='/' className='flex items-center space-x-3'>
            <Image
              src='/logo-white.png'
              alt='Xhosa Hip Hop Vids'
              width={40}
              height={40}
            />
            <span className='text-white font-bold text-xl tracking-wide hidden lg:block'>
              Xhosa Hip Hop Vids
            </span>
          </Link>

          {/* Navigation Links */}
          <div className='flex space-x-6'>
            <Link
              href='https://www.espazza.co.za'
              className='text-gray-300 hover:text-yellow-400 transition duration-300 text-lg font-semibold'
            >
              eSpazza
            </Link>
            <Link
              href='/videos'
              className='text-gray-300 hover:text-yellow-400 transition duration-300 text-lg font-semibold'
            >
              Videos
            </Link>
            <Link
              href='/about'
              className='text-gray-300 hover:text-yellow-400 transition duration-300 text-lg font-semibold'
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
