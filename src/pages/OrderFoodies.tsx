import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { foodStores } from '../data/foodStores';
import { useFoodOrder } from '../contexts/FoodOrderContext';

export function OrderFoodies() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, isItemInCart, getCartCount } = useFoodOrder();

  const store = foodStores.find(s => s.id === storeId);

  if (!store) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Store not found</p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const cartCount = getCartCount();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/shop')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>

          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-800" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-2">Order Foodies</p>
        <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
      </div>

      <div className="flex-1 overflow-y-auto mt-28 px-4 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {store.foods.map(food => (
            <div
              key={food.id}
              className={`bg-white rounded-lg overflow-hidden shadow-sm transition-all ${
                isItemInCart(food.id) ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <img
                src={food.image}
                alt={food.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  {food.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-bold text-sm">
                    K{food.price}
                  </span>
                  <button
                    onClick={() =>
                      addToCart({
                        id: food.id,
                        name: food.name,
                        price: food.price,
                        image: food.image,
                      })
                    }
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isItemInCart(food.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white px-4 py-3 border-t border-gray-100">
        <button
          disabled={cartCount === 0}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            cartCount > 0
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Complete Order ({cartCount})
        </button>
      </div>
    </div>
  );
}
