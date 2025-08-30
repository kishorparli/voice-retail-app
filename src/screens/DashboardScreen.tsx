import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import VoiceSearchBar from '../components/VoiceSearchBar';
import { parseIntent } from '../services/ai';
import { simpleParse } from '../utils/nlpFallback';
import { searchProducts } from '../services/db';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { theme } from '../utils/theme';

export default function DashboardScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { add, items } = useCart();

  // Load featured products on component mount
  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  async function loadFeaturedProducts() {
    try {
      setLoading(true);
      console.log('🌟 Loading featured products...');
      
      // Get a mix of popular products from different categories
      const featuredItems = await searchProducts({ 
        limit: 4 // Get 4 featured products
      });
      
      console.log('🌟 Featured products loaded:', featuredItems.length);
      setFeaturedProducts(featuredItems);
    } catch (error) {
      console.log('❌ Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function runSearch(fromVoice = false) {
    const ask = q.trim();
    console.log('🔍 runSearch called with query:', ask);
    if (!ask) {
      console.log('🔍 Empty query, returning');
      return;
    }

    console.log('🤖 Parsing intent with AI...');
    // 1) Try AI
    let intent = await parseIntent(ask);
    console.log('🤖 AI intent result:', intent);

    // 2) Fallback rules
    if (!intent || Object.keys(intent).length === 0) {
      console.log('🔧 Using fallback parsing...');
      intent = simpleParse(ask);
      console.log('🔧 Fallback intent result:', intent);
    }

    // Direct add-to-cart flow
    if (intent.productName) {
      console.log('🛒 Direct add-to-cart flow for:', intent.productName);
      const items = await searchProducts({ text: intent.productName });
      if (items.length) {
        const chosen = items[0];
        add({ id: chosen.id, name: chosen.name, price: chosen.price }, intent.quantity || 1);
        Alert.alert('Added', `${intent.quantity || 1} × ${chosen.name} added to cart`);
        setResults([]);
        return;
      }
    }

    // Search flow
    console.log('🔍 Searching products with intent:', intent);
    const searchParams = {
      category: intent.category,
      price: intent.price,
      text: intent.text || (!intent.category ? ask : undefined)
    };
    console.log('🔍 Search parameters:', searchParams);

    const items = await searchProducts(searchParams);
    console.log('🔍 Search results:', items.length, 'items found');
    setResults(items);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.small,
      }}>
        <View>
          <Text style={{
            fontSize: 24,
            fontWeight: '800',
            color: theme.colors.primary
          }}>
            🛒 Voice Retail
          </Text>
          <Text style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 2
          }}>
            Smart shopping with AI
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={{
            backgroundColor: items.length > 0 ? theme.colors.secondary : theme.colors.border,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.borderRadius.large,
            flexDirection: 'row',
            alignItems: 'center',
            ...theme.shadows.small,
          }}
        >
          <Text style={{
            fontSize: 18,
            marginRight: 6
          }}>🛒</Text>
          <Text style={{
            color: items.length > 0 ? 'white' : theme.colors.textSecondary,
            fontWeight: '600',
            fontSize: 16
          }}>
            Cart ({items.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
        {/* Search Section */}
        <View style={{ marginTop: theme.spacing.md }}>
          <VoiceSearchBar value={q} onChangeText={setQ} onSubmit={() => runSearch()} />

          {/*<View style={{
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.medium,
            marginBottom: theme.spacing.md,
            ...theme.shadows.small,
          }}>
             <Text style={{
              fontSize: 16,
              color: theme.colors.text,
              fontWeight: '600',
              marginBottom: 6
            }}>
             💡 Try these commands:
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              lineHeight: 20
            }}>
              • "breakfast under 200"{'\n'}
              • "order 2 dosa batter"{'\n'}
              • "find coconut chutney"
            </Text>
          </View>*/}
        </View>

        {/* Products Section */}
        {loading ? (
          <View style={{
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.xl,
            borderRadius: theme.borderRadius.large,
            alignItems: 'center',
            marginTop: theme.spacing.lg,
            ...theme.shadows.medium,
          }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              marginTop: theme.spacing.md,
              textAlign: 'center'
            }}>
              Loading products...
            </Text>
          </View>
        ) : (
          <>
            {/* Section Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.md,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: theme.colors.text,
              }}>
                {results.length > 0 ? `Search Results (${results.length})` :
                 q.length > 0 ? 'No Results Found' :
                 '🌟 Featured Products'}
              </Text>
              {results.length === 0 && q.length === 0 && (
                <TouchableOpacity
                  onPress={loadFeaturedProducts}
                  style={{
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 4,
                    borderRadius: theme.borderRadius.small,
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    Refresh
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Products List */}
            <FlatList
              data={results.length > 0 ? results : featuredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard p={item} onAdd={() => add({ id: item.id, name: item.name, price: item.price })} />
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                q.length > 0 ? (
                  <View style={{
                    backgroundColor: theme.colors.surface,
                    padding: theme.spacing.xl,
                    borderRadius: theme.borderRadius.large,
                    alignItems: 'center',
                    marginTop: theme.spacing.lg,
                    ...theme.shadows.medium,
                  }}>
                    <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>🔍</Text>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: theme.colors.text,
                      textAlign: 'center',
                      marginBottom: theme.spacing.sm
                    }}>
                      No products found for "{q}"
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: theme.colors.textSecondary,
                      textAlign: 'center',
                      lineHeight: 22
                    }}>
                      Try searching for:{'\n'}
                      • "breakfast under 100"{'\n'}
                      • "spices over 50"{'\n'}
                      • "olive oil"
                    </Text>
                  </View>
                ) : (
                  <View style={{
                    backgroundColor: theme.colors.surface,
                    padding: theme.spacing.xl,
                    borderRadius: theme.borderRadius.large,
                    alignItems: 'center',
                    marginTop: theme.spacing.lg,
                    ...theme.shadows.medium,
                  }}>
                    <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>🎤</Text>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: theme.colors.text,
                      textAlign: 'center',
                      marginBottom: theme.spacing.sm
                    }}>
                      Start Your Voice Shopping
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: theme.colors.textSecondary,
                      textAlign: 'center',
                      lineHeight: 22
                    }}>
                      Browse featured products or use voice search{'\n'}
                      Try: "show me breakfast items"
                    </Text>
                  </View>
                )
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}