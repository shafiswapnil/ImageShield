import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-8 bg-primary text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="#" className="text-gray-300 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              Contact
            </a>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-300 md:text-right">
              &copy; {new Date().getFullYear()} AI Defense Watermarker. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
