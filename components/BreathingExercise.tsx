import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  Easing,
  cancelAnimation
} from 'react-native-reanimated';

const PHASES = {
  IDLE: 'idle',
  INHALE: 'inhale',
  HOLD: 'hold',
  EXHALE: 'exhale'
};

const TOTAL_CYCLES = 5;
const INHALE_DURATION = 5000;
const HOLD_DURATION = 3000;
const EXHALE_DURATION = 5000;

export default function BreathingExercise() {
  const { width, height } = Dimensions.get('window');
  
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [cycle, setCycle] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const rotate = useSharedValue(0);
  const counterRotate = useSharedValue(0);
  const progress = useSharedValue(0);

  const timers = React.useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timers.current.forEach(id => clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => {
    return () => {
      stopExercise();
    };
  }, []);

  const ringContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const rotatingRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotate.value * 360}deg` }],
    opacity: opacity.value
  }));

  const counterRotatingRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${-counterRotate.value * 360}deg` }],
    opacity: opacity.value
  }));

  const centerDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const waveProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
      height: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: 20
    };
  });

  const startExercise = () => {
    if (isActive && !isPaused) return;
    
    if (isPaused) {
      resumeExercise();
      return;
    }
    
    stopExercise();
    setCycle(0);
    setIsActive(true);
    setIsPaused(false);
    
    rotate.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.linear }), 
      -1, 
      false
    );
    
    counterRotate.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.linear }), 
      -1, 
      false
    );
    
    startInhalePhase();
  };

  const startInhalePhase = () => {
    setPhase(PHASES.INHALE);
    
    scale.value = withTiming(1.5, {
      duration: INHALE_DURATION,
      easing: Easing.inOut(Easing.cubic)
    });
    
    opacity.value = withTiming(1, {
      duration: INHALE_DURATION,
      easing: Easing.inOut(Easing.ease)
    });
    
    progress.value = withTiming(0.33, {
      duration: INHALE_DURATION,
      easing: Easing.linear
    });
    
    const id = setTimeout(() => {
      if (!isPaused) {
        startHoldPhase();
      }
    }, INHALE_DURATION);
    
    timers.current.push(id);
  };

  const startHoldPhase = () => {
    setPhase(PHASES.HOLD);
    
    progress.value = withTiming(0.66, {
      duration: HOLD_DURATION,
      easing: Easing.linear
    });
    
    const id = setTimeout(() => {
      if (!isPaused) {
        startExhalePhase();
      }
    }, HOLD_DURATION);
    
    timers.current.push(id);
  };

  const startExhalePhase = () => {
    setPhase(PHASES.EXHALE);
    
    scale.value = withTiming(1, {
      duration: EXHALE_DURATION,
      easing: Easing.inOut(Easing.cubic)
    });
    
    opacity.value = withTiming(0.7, {
      duration: EXHALE_DURATION,
      easing: Easing.inOut(Easing.ease)
    });
    
    progress.value = withTiming(1, {
      duration: EXHALE_DURATION,
      easing: Easing.linear
    });
    
    const id = setTimeout(() => {
      if (!isPaused) {
        const nextCycle = cycle + 1;
        setCycle(nextCycle);
        
        if (nextCycle < TOTAL_CYCLES) {
          progress.value = 0;
          startInhalePhase();
        } else {
          stopExercise();
        }
      }
    }, EXHALE_DURATION);
    
    timers.current.push(id);
  };

  const pauseExercise = () => {
    if (!isActive || isPaused) return;
    
    setIsPaused(true);
    
    cancelAnimation(scale);
    cancelAnimation(opacity);
    cancelAnimation(rotate);
    cancelAnimation(counterRotate);
    cancelAnimation(progress);
    
    clearTimers();
  };

  const resumeExercise = () => {
    if (!isPaused || !isActive) return;
    
    setIsPaused(false);
    
    rotate.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.linear }), 
      -1, 
      false
    );
    
    counterRotate.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.linear }), 
      -1, 
      false
    );
    
    let duration = INHALE_DURATION;
    let targetProgress = 0.33;
    
    if (phase === PHASES.INHALE) {
      const progressRatio = progress.value / 0.33;
      duration = INHALE_DURATION * (1 - progressRatio);
      targetProgress = 0.33;
    } else if (phase === PHASES.HOLD) {
      const progressRatio = (progress.value - 0.33) / 0.33;
      duration = HOLD_DURATION * (1 - progressRatio);
      targetProgress = 0.66;
    } else if (phase === PHASES.EXHALE) {
      const progressRatio = (progress.value - 0.66) / 0.34;
      duration = EXHALE_DURATION * (1 - progressRatio);
      targetProgress = 1;
    }
    
    duration = Math.max(duration, 100);
    
    if (phase === PHASES.INHALE) {
      scale.value = withTiming(1.5, {
        duration,
        easing: Easing.inOut(Easing.cubic)
      });
      
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease)
      });
    } else if (phase === PHASES.EXHALE) {
      scale.value = withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.cubic)
      });
      
      opacity.value = withTiming(0.7, {
        duration,
        easing: Easing.inOut(Easing.ease)
      });
    }
    
    progress.value = withTiming(targetProgress, {
      duration,
      easing: Easing.linear
    });
    
    const id = setTimeout(() => {
      if (!isPaused) {
        if (phase === PHASES.INHALE) {
          startHoldPhase();
        } else if (phase === PHASES.HOLD) {
          startExhalePhase();
        } else if (phase === PHASES.EXHALE) {
          const nextCycle = cycle + 1;
          setCycle(nextCycle);
          
          if (nextCycle < TOTAL_CYCLES) {
            progress.value = 0;
            startInhalePhase();
          } else {
            stopExercise();
          }
        }
      }
    }, duration);
    
    timers.current.push(id);
  };

  const stopExercise = () => {
    if (!isActive && phase === PHASES.IDLE) return;
    
    cancelAnimation(scale);
    cancelAnimation(opacity);
    cancelAnimation(rotate);
    cancelAnimation(counterRotate);
    cancelAnimation(progress);
    
    scale.value = 1;
    opacity.value = 0.7;
    rotate.value = 0;
    counterRotate.value = 0;
    progress.value = 0;
    
    clearTimers();
    
    setIsActive(false);
    setIsPaused(false);
    setPhase(PHASES.IDLE);
    setCycle(0);
  };

  const handleMainButtonPress = () => {
    if (!isActive) {
      startExercise();
    } else if (isPaused) {
      resumeExercise();
    } else {
      pauseExercise();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.breathingContainer, { height: height * 0.6 }]}>
        <Animated.View style={[styles.ringContainer, ringContainerStyle]}>
          <View style={styles.outerRing} />
          
          <Animated.View style={[styles.middleRing, rotatingRingStyle]} />
          
          <Animated.View style={[styles.innerRing, counterRotatingRingStyle]} />
          
          <Animated.View style={[styles.centerDot, centerDotStyle]} />
        </Animated.View>
      </View>
      
      <View style={styles.controlsContainer}>
        <View style={styles.phaseIndicators}>
          <Text style={[
            styles.phaseText, 
            phase === PHASES.INHALE ? styles.activePhase : styles.inactivePhase
          ]}>
            inhale
          </Text>
          <Text style={[
            styles.phaseText, 
            phase === PHASES.HOLD ? styles.activePhase : styles.inactivePhase
          ]}>
            hold
          </Text>
          <Text style={[
            styles.phaseText, 
            phase === PHASES.EXHALE ? styles.activePhase : styles.inactivePhase
          ]}>
            exhale
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={waveProgressStyle} />
          </View>
        </View>
        
        <Text style={styles.cycleText}>
          Cycle {cycle + 1}/{TOTAL_CYCLES}
        </Text>
        
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={handleMainButtonPress}
          >
            <Text style={styles.buttonText}>
              {!isActive ? 'Start' : (isPaused ? 'Resume' : 'Pause')}
            </Text>
          </Pressable>
          
          {isActive && (
            <Pressable
              style={styles.secondaryButton}
              onPress={stopExercise}
            >
              <Text style={styles.buttonText}>Stop</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5c67e5',
  },
  breathingContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  middleRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  innerRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderStyle: 'dashed',
  },
  centerDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  controlsContainer: {
    flex: 2,
    justifyContent: 'flex-start',
    padding: 20,
  },
  phaseIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  activePhase: {
    opacity: 1,
    textDecorationLine: 'underline',
  },
  inactivePhase: {
    opacity: 0.4,
  },
  progressBarContainer: {
    height: 40,
    width: '100%',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBackground: {
    height: 40,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cycleText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#a78bfa',
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#ec4899',
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 