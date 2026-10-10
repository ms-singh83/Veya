import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme';

interface Props {
  size?: number;
  /** Gentle breathing animation. Disable for static contexts (e.g. small icons). */
  animated?: boolean;
}

/** The Veya mark: a dark core inside a glowing cyan–blue sphere. */
export function VeyaOrb({ size = 128, animated = true }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.85] });

  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel="Veya">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowOpacity }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {[46, 44, 42].map((r, i) => (
            <Circle
              key={r}
              cx={50}
              cy={50}
              r={r}
              stroke={colors.orbCyan}
              strokeOpacity={0.12 + i * 0.08}
              strokeWidth={4}
              fill="none"
            />
          ))}
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="body" cx="48%" cy="46%" r="52%">
              <Stop offset="0" stopColor={colors.orbCore} />
              <Stop offset="0.55" stopColor={colors.orbCore} />
              <Stop offset="0.74" stopColor={colors.orbIndigo} />
              <Stop offset="0.87" stopColor={colors.orbBlue} />
              <Stop offset="0.95" stopColor={colors.orbTeal} />
              <Stop offset="1" stopColor={colors.orbCyan} />
            </RadialGradient>
            <LinearGradient id="swirl" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.orbBlue} stopOpacity={0.35} />
              <Stop offset="1" stopColor={colors.orbTeal} stopOpacity={0.1} />
            </LinearGradient>
          </Defs>
          <Circle cx={50} cy={50} r={40} fill="url(#body)" />
          <Ellipse
            cx={55}
            cy={40}
            rx={18}
            ry={13}
            stroke="url(#swirl)"
            strokeWidth={3}
            fill="none"
            rotation={-20}
            origin="55, 40"
          />
          <Circle
            cx={50}
            cy={50}
            r={39.5}
            stroke={colors.orbCyan}
            strokeOpacity={0.9}
            strokeWidth={1}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
