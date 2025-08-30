import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';

type Props = { p: any; onAdd: () => void };
export default function ProductCard({ p, onAdd }: Props) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breakfast': return '🥞';
      case 'ready_to_eat': return '🍽️';
      case 'spices': return '🌶️';
      case 'condiments': return '🥄';
      default: return '🛒';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakfast': return '#F59E0B';
      case 'ready_to_eat': return '#10B981';
      case 'spices': return '#EF4444';
      case 'condiments': return '#8B5CF6';
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      marginHorizontal: 2,
      ...theme.shadows.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '700', 
            color: theme.colors.text,
            marginBottom: 4,
          }}>
            {p.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs }}>
            <Text style={{ fontSize: 16 }}>{getCategoryIcon(p.category)}</Text>
            <Text style={{ 
              fontSize: 14, 
              color: getCategoryColor(p.category),
              fontWeight: '600',
              marginLeft: 6,
              textTransform: 'capitalize'
            }}>
              {p.category.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: theme.colors.success,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 4,
          borderRadius: theme.borderRadius.small,
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '700', 
            color: 'white'
          }}>
            ₹{p.price}
          </Text>
        </View>
      </View>

      {p.tags && p.tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm }}>
          {p.tags.map((tag: string, index: number) => (
            <View key={index} style={{
              backgroundColor: theme.colors.background,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 2,
              borderRadius: theme.borderRadius.small,
              marginRight: theme.spacing.xs,
              marginBottom: theme.spacing.xs,
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: theme.colors.textSecondary,
                fontWeight: '500'
              }}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        onPress={onAdd} 
        style={{ 
          backgroundColor: theme.colors.primary,
          paddingVertical: theme.spacing.sm + 2,
          borderRadius: theme.borderRadius.medium,
          alignItems: 'center',
          ...theme.shadows.small,
        }}
      >
        <Text style={{ 
          color: 'white', 
          fontWeight: '600', 
          fontSize: 16 
        }}>
          🛒 Add to Cart
        </Text>
      </TouchableOpacity>
    </View>
  );
}