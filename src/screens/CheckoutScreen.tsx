import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, FlatList } from 'react-native';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/db';
import { theme } from '../utils/theme';

export default function CheckoutScreen({ navigation }: any) {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  
  async function onPlace() {
    setLoading(true);
    try {
      const orderId = await placeOrder({ items, total });
      setLoading(false);
      clear();
      Alert.alert(
        '🎉 Order Placed Successfully!', 
        `Your order ID is: ${orderId}`,
        [
          { text: 'Track Order', onPress: () => navigation.navigate('Track Order', { orderId }) }
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
        
        {/* Header */}
        <View style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.medium,
          marginVertical: theme.spacing.md,
          ...theme.shadows.small,
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: '700', 
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: theme.spacing.sm
          }}>
            🛒 Order Summary
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: theme.colors.textSecondary,
            textAlign: 'center'
          }}>
            Review your order before placing
          </Text>
        </View>

        {/* Order Items */}
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.medium,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...theme.shadows.small,
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: theme.colors.text,
            marginBottom: theme.spacing.md
          }}>
            📦 Items ({items.length})
          </Text>
          
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: theme.spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: theme.colors.text 
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: theme.colors.textSecondary 
                  }}>
                    ₹{item.price} × {item.qty}
                  </Text>
                </View>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: theme.colors.success 
                }}>
                  ₹{item.price * item.qty}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Total */}
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.medium,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...theme.shadows.medium,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: theme.colors.text 
            }}>
              💰 Total Amount
            </Text>
            <Text style={{ 
              fontSize: 28, 
              fontWeight: '800', 
              color: theme.colors.success 
            }}>
              ₹{total}
            </Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity 
          disabled={loading} 
          onPress={onPlace} 
          style={{ 
            backgroundColor: loading ? theme.colors.border : theme.colors.primary,
            paddingVertical: theme.spacing.md + 4,
            borderRadius: theme.borderRadius.medium,
            alignItems: 'center',
            ...theme.shadows.medium,
          }}
        >
          <Text style={{ 
            color: loading ? theme.colors.textSecondary : 'white', 
            fontWeight: '700', 
            fontSize: 18 
          }}>
            {loading ? '⏳ Placing Order...' : '🚀 Place Order'}
          </Text>
        </TouchableOpacity>

        <Text style={{ 
          fontSize: 14, 
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.md,
          lineHeight: 20
        }}>
          By placing this order, you agree to our terms and conditions.{'\n'}
          You will receive an order confirmation shortly.
        </Text>
      </View>
    </SafeAreaView>
  );
}