import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LineChartData } from '@/types/app';

interface LineChartProps {
  data: LineChartData;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export default function LineChart({ 
  data, 
  height = 220, 
  showGrid = true, 
  showLegend = false 
}: LineChartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => colors.text + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: showGrid ? '5,5' : '0,0',
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  return (
    <View style={styles.container}>
      <RNLineChart
        data={data}
        width={screenWidth - 32} // Account for padding
        height={height}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={showGrid}
        withOuterLines={showGrid}
        withVerticalLines={showGrid}
        withHorizontalLines={showGrid}
        withDots={true}
        withShadow={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
