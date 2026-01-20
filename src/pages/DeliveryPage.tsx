import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, Bike, Car, Zap } from 'lucide-react';
import { useFoodOrderSession } from '../contexts/FoodOrderSession';
import { useDeliveryEstimation, calculateFoodSubtotal, calculateRouteDistance, getDeliveryModesByTab, DeliveryMode, DELIVERY_MODES } from '../hooks/useDeliveryEstimation';

export function DeliveryPage() {
  const navigate = useNavigate();
  const { cartItems, currentLocationFoodIds, stops } = useFoodOrderSession();

  const [selectedMode, setSelectedMode] = useState<DeliveryMode>('motorbike');
  const [activeTab, setActiveTab] = useState<'recommended' | 'faster' | 'cheaper'>('recommended');
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragStartY, setDragStartY] = useState(0);

  const foodSubtotal = calculateFoodSubtotal(cartItems);
  const routeDistance = calculateRouteDistance(
    'Current Location',
    stops,
    'Delivery Address'
  );

  const estimate = useDeliveryEstimation({
    foodSubtotal,
    routeDistance,
    numberOfStops: stops.length,
    deliveryMode: selectedMode
  });

  const filteredModes = getDeliveryModesByTab(activeTab);

  const handleBackToRoute = () => {
    navigate('/foodies-route');
  };

  const handleSelectMode = (mode: DeliveryMode) => {
    setSelectedMode(mode);
    const modeData = DELIVERY_MODES.find(m => m.id === mode);
    if (modeData) {
      navigate('/confirm-order', {
        state: {
          isDelivery: true,
          deliveryType: mode,
          deliveryModeData: modeData,
          estimate,
          cartItems,
          stops
        }
      });
    }
  };

  const buildRouteString = () => {
    const parts = ['Current Location'];
    stops.forEach(stop => {
      if (stop.address) {
        const foodCount = stop.foodIds.length;
        parts.push(`${stop.address} (${foodCount} items)`);
      }
    });
    const currentFoodCount = currentLocationFoodIds.length;
    if (currentFoodCount > 0 && parts.length === 1) {
      parts.push(`Delivery (${currentFoodCount} items)`);
    }
    return parts.join(' → ');
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStartY(clientY);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const diff = dragStartY - clientY;

    if (diff > 50) {
      setPanelExpanded(true);
    } else if (diff < -50) {
      setPanelExpanded(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-screen overflow-hidden bg-gray-100"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 z-0">
        <div className="w-full h-full flex items-center justify-center text-gray-600">
          <p className="text-lg">Map Container</p>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBackToRoute}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X size={20} className="text-gray-700" />
            </button>
            <button
              onClick={handleBackToRoute}
              className="flex-1 mx-4 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 text-center truncate hover:bg-gray-100"
            >
              {buildRouteString()}
            </button>
            <button
              onClick={handleBackToRoute}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <Plus size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={dragRef}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        className={`absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ${
          panelExpanded ? 'h-5/6' : 'h-2/5'
        }`}
      >
        <div className="w-full h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 cursor-grab active:cursor-grabbing">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <motion.div
              layout
              className="bg-blue-600 text-white p-3 rounded-lg flex items-center justify-between"
            >
              <span className="text-sm font-medium">✓ 30% promo applied</span>
              <ChevronDown size={16} />
            </motion.div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            {panelExpanded && (
              <>
                <div className="px-4 py-4 border-b border-gray-200">
                  <div className="flex gap-3">
                    {['recommended', 'faster', 'cheaper'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeTab === tab
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-4 space-y-3">
                  {filteredModes.map(mode => (
                    <motion.button
                      key={mode.id}
                      onClick={() => handleSelectMode(mode.id as DeliveryMode)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        selectedMode === mode.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-4xl flex-shrink-0">
                        {mode.icon}
                      </div>

                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-gray-900 text-lg">{mode.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{mode.description}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-gray-900">R {mode.basePrice + estimate.deliveryFee}</div>
                        <div className="text-xs text-gray-600 mt-1">R {mode.basePrice}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="px-4 py-4 bg-gray-50 mt-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>Food subtotal</span>
                      <span className="font-medium">R {foodSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery fee</span>
                      <span className="font-medium">R {estimate.deliveryFee}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>R {estimate.totalPrice}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!panelExpanded && (
              <div className="px-4 py-6 space-y-4">
                {DELIVERY_MODES.slice(0, 1).map(mode => (
                  <motion.button
                    key={mode.id}
                    onClick={() => handleSelectMode(mode.id as DeliveryMode)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300"
                  >
                    <div className="text-4xl flex-shrink-0">{mode.icon}</div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900 text-lg">{mode.name}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-gray-900">
                        R {mode.basePrice + estimate.deliveryFee}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <motion.button
                onClick={() => handleSelectMode(selectedMode)}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                Select {DELIVERY_MODES.find(m => m.id === selectedMode)?.name || 'Delivery'}
              </motion.button>
              <button
                onClick={() => setShowPaymentPanel(true)}
                className="flex items-center gap-2 px-4 py-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <span className="text-xl">💵</span>
                <span className="text-sm font-medium text-gray-700">Cash</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-50 flex items-end"
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="w-full bg-white rounded-t-3xl p-6"
            >
              <button
                onClick={() => setShowPaymentPanel(false)}
                className="absolute top-4 right-4 text-gray-600"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6 mt-4">Payment</h2>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Bolt balance</p>
                  <p className="text-3xl font-bold text-gray-900">R 0</p>
                  <p className="text-xs text-gray-600 mt-2">Bolt balance is not available with this payment method</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Payment methods</h3>
                <div className="flex gap-2 mb-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700">
                    Personal
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
                    Work
                  </button>
                </div>

                <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💵</span>
                    <span className="font-medium text-gray-900">Cash</span>
                  </div>
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">➕</span>
                    <span className="font-medium text-gray-900">Add debit/credit card</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowPaymentPanel(false)}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
