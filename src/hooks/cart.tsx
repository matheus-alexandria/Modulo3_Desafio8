import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { loadPartialConfig } from '@babel/core';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const loadedProducts = await AsyncStorage.getItem('@GoMarketplace:item');

      if (loadedProducts) {
        setProducts(JSON.parse(loadedProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function updateProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:item',
        JSON.stringify(products),
      );
    }

    updateProducts();
  }, [products]);

  const addToCart = useCallback(
    async ({ id, title, image_url, price }: Omit<Product, 'quantity'>) => {
      const isNewProduct = products.find(product => product.id === id);

      if (!isNewProduct) {
        setProducts([
          ...products,
          { id, title, image_url, price, quantity: 1 },
        ]);

        return;
      }

      const updatedProducts = products.map(product => {
        if (product.id !== id) {
          return product;
        }

        const updatedProduct = {
          id,
          title,
          image_url,
          price,
          quantity: product.quantity += 1,
        };

        return updatedProduct;
      });

      setProducts(updatedProducts);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = products.map(product => {
        if (product.id !== id) {
          return product;
        }

        const updatedProduct = {
          ...product,
          quantity: product.quantity += 1,
        };

        return updatedProduct;
      });

      setProducts(updatedProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = products
        .map(product => {
          if (product.id !== id) {
            return product;
          }

          const updatedProduct = {
            ...product,
            quantity: product.quantity -= 1,
          };

          return updatedProduct;
        })
        .filter(product => product.quantity > 0);

      setProducts(updatedProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
