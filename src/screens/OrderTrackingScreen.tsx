import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { getOrderStatus } from '../services/db';
import { theme } from '../utils/theme';

const STATUS_CONFIG: Record<string, {
  icon: string;
  title: string;
  description: string;
  color: string;
  progress: number;
}> = {
  received: {
    icon: '📦',
    title: 'Order Received',
    description: 'We\'ve got your order and are preparing it with care',
    color: '#3B82F6',
    progress: 25
  },
  processing: {
    icon: '👨‍🍳',
    title: 'Being Prepared',
    description: 'Our team is carefully packing your items',
    color: '#F59E0B',
    progress: 50
  },
  out_for_delivery: {
    icon: '🚚',
    title: 'Out for Delivery',
    description: 'Your order is on its way to you!',
    color: '#8B5CF6',
    progress: 75
  },
  delivered: {
    icon: '🎉',
    title: 'Delivered',
    description: 'Enjoy your fresh groceries!',
    color: '#10B981',
    progress: 100
  }
};

export default function OrderTrackingScreen({ route }: any) {
  const [orderId, setOrderId] = useState(route?.params?.orderId || '');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onCheck() {
    if (!orderId.trim()) {
      setError('Please enter an Order ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getOrderStatus(orderId);
      if (!data) {
        setError(`No order found for ID: ${orderId}`);
        setOrderData(null);
      } else {
        setOrderData(data);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch order status');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  }

  const renderProgressBar = (progress: number, color: string) => (
    <View style={{
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 3,
      marginVertical: theme.spacing.sm,
      overflow: 'hidden',
    }}>
      <View style={{
        height: '100%',
        width: `${progress}%`,
        backgroundColor: color,
        borderRadius: 3,
      }} />
    </View>
  );

  const renderStatusCard = () => {
    if (!orderData) return null;

    const statusInfo = STATUS_CONFIG[orderData.status] || {
      icon: '📋',
      title: 'Unknown Status',
      description: `Status: ${orderData.status}`,
      color: theme.colors.textSecondary,
      progress: 0
    };

    return (
      <View style={{
        backgroundColor: theme.colors.surfaceGlass,
        borderRadius: theme.borderRadius.large,
        padding: theme.spacing.lg,
        marginTop: theme.spacing.lg,
        ...theme.shadows.large,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.md,
          }}>
            <Text style={{ fontSize: 28 }}>{statusInfo.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: 4,
            }}>
              {statusInfo.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              fontWeight: '500',
            }}>
              Order #{orderId}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {renderProgressBar(statusInfo.progress, statusInfo.color)}

        {/* Description */}
        <Text style={{
          fontSize: 16,
          color: theme.colors.textSecondary,
          lineHeight: 24,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
        }}>
          {statusInfo.description}
        </Text>

        {/* Timeline Steps */}
        <View style={{ marginTop: theme.spacing.lg }}>
          {Object.entries(STATUS_CONFIG).map(([status, config], index) => {
            const isActive = Object.keys(STATUS_CONFIG).indexOf(orderData.status) >= index;
            const isCurrent = orderData.status === status;

            return (
              <View key={status} style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.md,
                opacity: isActive ? 1 : 0.4,
              }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isActive ? config.color : 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.md,
                }}>
                  <Text style={{ fontSize: 16 }}>{config.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: isCurrent ? '700' : '500',
                    color: isActive ? theme.colors.text : theme.colors.textLight,
                  }}>
                    {config.title}
                  </Text>
                </View>
                {isCurrent && (
                  <View style={{
                    backgroundColor: config.color,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: theme.borderRadius.small,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: 'white',
                      fontWeight: '600',
                    }}>
                      Current
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{
      flex: 1,
      backgroundColor: theme.colors.background,
    }}>
      <View style={{ padding: theme.spacing.lg }}>
        {/* Header */}
        <View style={{
          backgroundColor: theme.colors.surfaceGlass,
          borderRadius: theme.borderRadius.large,
          padding: theme.spacing.lg,
          ...theme.shadows.medium,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          marginBottom: theme.spacing.md,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: theme.spacing.sm,
          }}>
            🚚 Track Your Order
          </Text>
          <Text style={{
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            Enter your order ID to get real-time updates
          </Text>
        </View>

        {/* Search Input */}
        <View style={{
          backgroundColor: theme.colors.surfaceGlass,
          borderRadius: theme.borderRadius.large,
          padding: theme.spacing.md,
          ...theme.shadows.medium,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: theme.borderRadius.medium,
            borderWidth: 2,
            borderColor: orderId ? theme.colors.primary : 'rgba(99, 102, 241, 0.2)',
          }}>
            <TextInput
              placeholder="Enter Order ID (e.g., ORD123456)"
              placeholderTextColor={theme.colors.textLight}
              value={orderId}
              onChangeText={(text) => {
                setOrderId(text);
                setError('');
              }}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.md,
                fontSize: 16,
                color: theme.colors.text,
                fontWeight: '500',
              }}
            />
          </View>

          <TouchableOpacity
            onPress={onCheck}
            disabled={loading}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.medium,
              paddingVertical: theme.spacing.md,
              marginTop: theme.spacing.sm,
              alignItems: 'center',
              ...theme.shadows.glow,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '700',
            }}>
              {loading ? '🔍 Searching...' : '🔍 Track Order'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: theme.borderRadius.medium,
            padding: theme.spacing.md,
            marginTop: theme.spacing.md,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}>
            <Text style={{
              color: '#EF4444',
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'center',
            }}>
              ❌ {error}
            </Text>
          </View>
        ) : null}

        {/* Status Card */}
        {renderStatusCard()}

        {/* Quick Actions */}
        {orderData && (
          <View style={{
            backgroundColor: theme.colors.surfaceGlass,
            borderRadius: theme.borderRadius.large,
            padding: theme.spacing.lg,
            marginTop: theme.spacing.lg,
            ...theme.shadows.medium,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: theme.spacing.md,
              textAlign: 'center',
            }}>
              Need Help?
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
              {[
                { icon: '📞', label: 'Call Support' },
                { icon: '💬', label: 'Live Chat' },
                { icon: '📧', label: 'Email Us' },
              ].map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.md,
                    borderRadius: theme.borderRadius.medium,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    fontWeight: '600',
                  }}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}