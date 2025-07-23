import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Banner_Slide_Image = ({ banners, interval = 5000, height = '400px', className = '' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slideRef = useRef(null);

    if (!banners) {
        // Skeleton loading
        return (
            <div className={`flex items-center justify-center h-64 bg-gray-200 text-gray-600 rounded-lg shadow-md font-semibold animate-pulse ${className}`}>Đang tải banner...</div>
        );
    }
    if (banners.length === 0) {
        return (
            <div className={`flex items-center justify-center h-64 bg-gray-200 text-gray-600 rounded-lg shadow-md font-semibold ${className}`}>Không có banner nào để hiển thị.</div>
        );
    }

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === banners.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };
        const node = slideRef.current;
        if (node) node.addEventListener('keydown', handleKeyDown);
        return () => {
            if (node) node.removeEventListener('keydown', handleKeyDown);
        };
    });

    useEffect(() => {
        const timer = setInterval(() => {
            goToNext();
        }, interval);
        return () => clearInterval(timer);
    }, [currentIndex, banners.length, interval]);

    return (
        <div
            className={`relative w-full rounded-lg overflow-hidden shadow-xl ${className}`}
            style={{ height }}
            tabIndex={0}
            ref={slideRef}
            aria-label="Banner slideshow"
        >
            <div
                className="w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out transform scale-100 hover:scale-105"
                style={{ backgroundImage: `url('${banners[currentIndex].image}')` }}
                role="img"
                aria-label={banners[currentIndex].alt || `Banner ${currentIndex + 1}`}
            >
            
                <img
                    src={banners[currentIndex].image}
                    alt={banners[currentIndex].alt || `Banner ${currentIndex + 1}`}
                    className="w-0 h-0 opacity-0 pointer-events-none"
                    aria-hidden="true"
                />
            </div>
            <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-gray-700 p-3 rounded-full focus:outline-none z-10 transition-all duration-300 transform hover:scale-110"
                aria-label="Previous slide"
            >
                <FaChevronLeft className="text-2xl" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-gray-700 p-3 rounded-full focus:outline-none z-10 transition-all duration-300 transform hover:scale-110"
                aria-label="Next slide"
            >
                <FaChevronRight className="text-2xl " />
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                {banners.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300
                            ${currentIndex === idx ? 'bg-orange-500 scale-125 shadow-md' : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                        tabIndex={0}
                        role="button"
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setCurrentIndex(idx)}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Banner_Slide_Image;