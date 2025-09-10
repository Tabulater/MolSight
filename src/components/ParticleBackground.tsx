import React from 'react';
import { motion } from 'framer-motion';

const ParticleBackground: React.FC = () => {
  // Generate particles with different types
  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 30,
    type: Math.random() > 0.7 ? 'glow' : 'normal',
  }));

  // Generate DNA helix points
  const dnaPoints = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 15 + Math.sin(i * 0.5) * 8,
    y: i * 5,
    size: Math.random() * 3 + 1,
    delay: i * 0.2,
  }));

  const dnaPoints2 = Array.from({ length: 20 }, (_, i) => ({
    id: i + 20,
    x: 85 + Math.sin(i * 0.5 + Math.PI) * 8,
    y: i * 5,
    size: Math.random() * 3 + 1,
    delay: i * 0.2 + 0.5,
  }));

  // Generate molecular clusters
  const molecularClusters = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: [20, 80, 35, 65, 10, 90][i],
    y: [25, 75, 60, 40, 85, 15][i],
    size: Math.random() * 40 + 20,
    rotation: Math.random() * 360,
    duration: Math.random() * 40 + 30,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            particle.type === 'glow' 
              ? 'bg-gradient-to-r from-cyan-400/40 to-blue-400/40 shadow-lg shadow-cyan-400/20' 
              : 'bg-white/20'
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* DNA Helix Structures */}
      <div className="absolute left-0 top-0 w-full h-full">
        {dnaPoints.map((point) => (
          <motion.div
            key={point.id}
            className="absolute bg-cyan-400/30 rounded-full"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: point.size,
              height: point.size,
            }}
            animate={{
              y: [0, -2, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              delay: point.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {dnaPoints2.map((point) => (
          <motion.div
            key={point.id}
            className="absolute bg-blue-400/30 rounded-full"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: point.size,
              height: point.size,
            }}
            animate={{
              y: [0, -2, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              delay: point.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Molecular Clusters */}
      {molecularClusters.map((cluster) => (
        <motion.div
          key={cluster.id}
          className="absolute"
          style={{
            left: `${cluster.x}%`,
            top: `${cluster.y}%`,
            width: cluster.size,
            height: cluster.size,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: cluster.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Central atom */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400/40 rounded-full" />
          
          {/* Orbital electrons */}
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                x: [0, Math.cos(i * 60 * Math.PI / 180) * (cluster.size / 2)],
                y: [0, Math.sin(i * 60 * Math.PI / 180) * (cluster.size / 2)],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-1/3 right-1/3 w-16 h-16 opacity-20"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full border-2 border-cyan-400/50 rounded-lg relative">
          <div className="absolute top-1 left-1 w-2 h-2 bg-cyan-400/60 rounded-full" />
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-400/60 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400/60 rounded-full" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-1/3 w-12 h-12 opacity-20"
        animate={{
          rotate: -360,
          scale: [1.2, 1, 1.2],
          x: [0, -15, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full border-2 border-purple-400/50 rounded-full relative">
          <div className="absolute top-1 left-1 w-2 h-2 bg-purple-400/60 rounded-full" />
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-400/60 rounded-full" />
        </div>
      </motion.div>

      {/* Energy field lines */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={`energy-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
            style={{
              top: `${(i + 1) * 12}%`,
              left: '0%',
              width: '100%',
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 8,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>
    </div>
  );
};

export default ParticleBackground;