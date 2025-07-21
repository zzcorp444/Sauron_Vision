// static/js/particles.js
class ParticleSystem {
    constructor() {
        this.container = document.querySelector('.particles-container');
        this.particles = [];
        this.particleCount = 30;
        this.init();
    }
    
    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const sizes = ['small', 'medium', 'large'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        particle.classList.add(size);
        
        // Random depth
        const depths = ['far', 'mid', 'near'];
        const depth = depths[Math.floor(Math.random() * depths.length)];
        particle.classList.add(depth);
        
        // Random vertical position
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 15 + 's';
        
        // Random animation duration for varied speeds
        const duration = 15 + Math.random() * 10;
        particle.style.animationDuration = duration + 's';
        
        this.container.appendChild(particle);
        this.particles.push(particle);
    }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});