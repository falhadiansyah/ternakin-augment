import React from 'react';
import { Text, TextProps } from 'react-native';

export default function GlobalText(props: TextProps) {
  return <Text {...props} style={[{ fontFamily: 'Inter_500Medium' }, props.style]} />;
}

