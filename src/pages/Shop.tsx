import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { foodStores } from '../data/foodStores';

export function Shop() {
  const navigate = useNavigate();

  const handleStoreClick = (storeId: string) => {
    navigate(`/order-foodies/${storeId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white pt-4 pb-4 px-4 border-b border-gray-100">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-2xl font-bold text-center text-green-600">Shop</h1>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <p className="text-xs text-gray-500 text-center">Aletewende</p>
      </div>

      <div className="flex-1 overflow-y-auto mt-32 px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {foodStores.map(store => (
            <button
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className="flex flex-col rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={store.image}
                alt={store.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-gray-800 text-sm text-left">
                  {store.name}
                </h3>
                <p className="text-xs text-gray-500 text-left">
                  {store.foods.length} items
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
