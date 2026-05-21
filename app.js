/**
 * Aether - Modern Minimalist Hero Page Interactive Logic
 * Vanilla JavaScript implementation for dynamic interactions and premium feel.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const primaryCta = document.getElementById('primary-cta-btn');
    const secondaryCta = document.getElementById('secondary-cta-btn');
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    const imageWrapper = document.querySelector('.image-wrapper');
    const brandLogo = document.getElementById('brand-logo');
    const navFeatures = document.getElementById('nav-features');
    const navPricing = document.getElementById('nav-pricing');

    let toastTimeout;

    // Helper function to show notifications
    function showToast(message, emoji = '✨') {
        // Clear existing timeout
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        // Set message text
        toastMsg.textContent = message;
        
        // Find icon element and set it
        const iconSpan = toast.querySelector('.toast-icon');
        if (iconSpan) {
            iconSpan.textContent = emoji;
        }

        // Show toast
        toast.classList.add('show');

        // Hide after 3 seconds
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Button Click Listeners
    primaryCta.addEventListener('click', (e) => {
        // Create custom button ripple/active feedback
        createClickRipple(e, primaryCta);
        
        // Dynamic notification
        showToast('Trial account initialized! Welcome aboard.', '🚀');
    });

    secondaryCta.addEventListener('click', (e) => {
        createClickRipple(e, secondaryCta);
        showToast('Launching a 60-second interactive preview...', '🎬');
    });

    // Logo & Nav click responses
    brandLogo.addEventListener('click', () => {
        showToast('You are experiencing Aether Premium Page.', '💎');
    });

    navFeatures.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Redirecting to feature documentation...', '📑');
    });

    navPricing.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Opening our transparent pricing guide...', '💳');
    });

    // Premium 3D Tilt Effect on the central card/image
    if (imageWrapper) {
        imageWrapper.addEventListener('mousemove', (e) => {
            const rect = imageWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within element
            const y = e.clientY - rect.top;  // y position within element
            
            // Normalize inputs: -0.5 to 0.5
            const xPct = (x / rect.width) - 0.5;
            const yPct = (y / rect.height) - 0.5;
            
            // Calculate tilt degrees (max 6 degrees tilt for elegance)
            const tiltY = xPct * 12;
            const tiltX = -yPct * 12;
            
            // Apply scale and tilt
            // Temporarily pause the CSS floating float animation on manual mouse control
            imageWrapper.style.animation = 'none';
            imageWrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.025)`;
        });

        imageWrapper.addEventListener('mouseleave', () => {
            // Restore default states and resume floating animation smoothly
            imageWrapper.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            imageWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            
            // Re-enable keyframe float animation after transition completes
            setTimeout(() => {
                imageWrapper.style.transition = '';
                imageWrapper.style.animation = 'floatingFloat 6s ease-in-out infinite alternate';
            }, 500);
        });
        
        // Click on image brings up feature overview
        imageWrapper.addEventListener('click', () => {
            showToast('Analytics dashboard interactive zoom activated.', '📊');
        });
    }

    // Modern button click ripple effect generator
    function createClickRipple(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        
        // Calculate offset relative to the button bounds
        const rect = element.getBoundingClientRect();
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        
        // Apply ripple styles
        circle.style.position = 'absolute';
        circle.style.borderRadius = '50%';
        circle.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        if (element.classList.contains('secondary-cta')) {
            circle.style.backgroundColor = 'rgba(30, 45, 61, 0.15)';
        }
        circle.style.transform = 'scale(0)';
        circle.style.animation = 'ripple 0.6s linear';
        circle.style.pointerEvents = 'none';

        // Add to DOM inside the button
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        
        // Clean up previous ripples
        const existingRipple = element.querySelector('.ripple-effect');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        circle.classList.add('ripple-effect');
        element.appendChild(circle);
    }
});

// Add ripple keyframes dynamically to stylesheet
const style = document.createElement('style');
style.innerHTML = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);
