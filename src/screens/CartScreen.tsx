import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useCart } from '../context/CartContext';
import { theme } from '../utils/theme';

export default function CartScreen({ navigation }: any) {
  const { items, remove, total } = useCart();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
        
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ 
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.xl,
              borderRadius: theme.borderRadius.large,
              alignItems: 'center',
              marginTop: theme.spacing.xl,
              ...theme.shadows.medium,
            }}>
              <Text style={{ fontSize: 64, marginBottom: theme.spacing.md }}>🛒</Text>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: theme.spacing.sm
              }}>
                Your cart is empty
              </Text>
              <Text style={{ 
                fontSize: 16, 
                color: theme.colors.textSecondary,
                textAlign: 'center'
              }}>
                Add some products to get started
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.medium,
                  marginTop: theme.spacing.md,
                  ...theme.shadows.small,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                  Continue Shopping
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.medium,
              padding: theme.spacing.md,
              marginVertical: theme.spacing.sm,
              ...theme.shadows.small,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: theme.colors.text,
                    marginBottom: 4
                  }}>
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: theme.colors.background,
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: 2,
                      borderRadius: theme.borderRadius.small,
                      marginRight: theme.spacing.sm,
                    }}>
                      <Text style={{ 
                        fontSize: 14, 
                        fontWeight: '600',
                        color: theme.colors.primary
                      }}>
                        Qty: {item.qty}
                      </Text>
                    </View>
                    <Text style={{ 
                      fontSize: 14, 
                      color: theme.colors.textSecondary 
                    }}>
                      ₹{item.price} each
                    </Text>
                  </View>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: '700', 
                    color: theme.colors.success,
                    marginBottom: theme.spacing.xs
                  }}>
                    ₹{item.price * item.qty}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => remove(item.id)}
                    style={{
                      backgroundColor: theme.colors.error,
                      padding: theme.spacing.xs,
                      borderRadius: theme.borderRadius.small,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
        
        {items.length > 0 && (
          <View style={{
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.large,
            marginVertical: theme.spacing.md,
            ...theme.shadows.medium,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600', 
                color: theme.colors.text 
              }}>
                Total Amount
              </Text>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: '800', 
                color: theme.colors.success 
              }}>
                ₹{total}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Checkout')} 
              style={{ 
                backgroundColor: theme.colors.primary,
                paddingVertical: theme.spacing.md,
                borderRadius: theme.borderRadius.medium,
                alignItems: 'center',
                ...theme.shadows.small,
              }}
            >
              <Text style={{ 
                color: 'white', 
                fontWeight: '700', 
                fontSize: 18 
              }}>
                🚀 Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}