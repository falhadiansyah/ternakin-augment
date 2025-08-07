import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ChartDataPoint } from '@/types/app';

interface PieChartProps {
  data: ChartDataPoint[];
  height?: number;
  showLegend?: boolean;
}

export default function PieChart({ 
  data, 
  height = 220, 
  showLegend = true 
}: PieChartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const screenWidth = Dimensions.get('window').width;

  // Convert data to chart format
  const chartData = data.map((item, index) => ({
    name: item.label,
    population: item.value,
    color: item.color || getDefaultColor(index),
    legendFontColor: colors.text,
    legendFontSize: 14,
  }));

  function getDefaultColor(index: number): string {
    const defaultColors = [
      colors.primary,
      colors.success,
      colors.warning,
      colors.error,
      '#9C27B0',
      '#FF5722',
      '#607D8B',
      '#795548',
    ];
    return defaultColors[index % defaultColors.length];
  }

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => colors.text + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={styles.container}>
      <RNPieChart
        data={chartData}
        width={screenWidth - 32}
        height={height}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        absolute={false}
        hasLegend={showLegend}
        style={styles.chart}
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
