import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface BarChartData {
  labels: string[];
  datasets: {
    data: number[];
    colors?: ((opacity: number) => string)[];
  }[];
}

interface BarChartProps {
  data: BarChartData;
  height?: number;
  showGrid?: boolean;
  showValues?: boolean;
}

export default function BarChart({ 
  data, 
  height = 220, 
  showGrid = true, 
  showValues = true 
}: BarChartProps) {
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
    propsForBackgroundLines: {
      strokeDasharray: showGrid ? '5,5' : '0,0',
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  return (
    <View style={styles.container}>
      <RNBarChart
        data={data}
        width={screenWidth - 32} // Account for padding
        height={height}
        chartConfig={chartConfig}
        style={styles.chart}
        withInnerLines={showGrid}
        withOuterLines={showGrid}
        withVerticalLines={showGrid}
        withHorizontalLines={showGrid}
        showValuesOnTopOfBars={showValues}
        fromZero={true}
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
