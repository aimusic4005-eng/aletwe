import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, UtensilsCrossed, X, Clock } from 'lucide-react';
import { useFoodOrderSession, FoodItem } from '../contexts/FoodOrderSession';
import { FoodSelectionModal } from '../components/FoodSelectionModal';
import { useGeolocation } from '../hooks/useGeolocation';
import { mockDeliveryAddresses, getDeliveryAddressSuggestions } from '../data/mockDeliveryAddresses';

export function FoodiesRoute() {
  const navigate = useNavigate();
  const { address: currentLocation, loading: locationLoading } = useGeolocation();
  const {
    cartItems,
    currentLocationFoodIds,
    stops,
    addStop,
    removeStop,
    updateStop,
    canAddStop,
    getCurrentLocationFoods,
    getStopFoods,
    removeStopsWithoutFoodOrAddress
  } = useFoodOrderSession();

  const currentLocationInputRef = useRef<HTMLInputElement>(null);
  const stopInputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  const [showCurrentLocationModal, setShowCurrentLocationModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState<string | null>(null);
  const [currentLocationQuery, setCurrentLocationQuery] = useState('');
  const [stopAddressQuery, setStopAddressQuery] = useState<{ [key: string]: string }>({});
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [activeLocationInput, setActiveLocationInput] = useState('current-location');
  const [showCurrentLocationSuggestions, setShowCurrentLocationSuggestions] = useState(false);
  const [showStopSuggestions, setShowStopSuggestions] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (currentLocation && !deliveryLocation) {
      setDeliveryLocation(currentLocation);
      setCurrentLocationQuery(currentLocation);
    }
  }, [currentLocation, deliveryLocation]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartItems.length, navigate]);

  useEffect(() => {
    if (activeLocationInput === 'current-location' && currentLocationInputRef.current) {
      currentLocationInputRef.current.focus();
    } else if (activeLocationInput && stopInputRefs.current[activeLocationInput]) {
      stopInputRefs.current[activeLocationInput].focus();
    }
  }, [activeLocationInput]);

  const handleCurrentLocationChange = (value: string) => {
    setCurrentLocationQuery(value);
    setShowCurrentLocationSuggestions(true);
  };

  const handleCurrentLocationSelect = (address: string, description: string) => {
    setDeliveryLocation(address);
    setCurrentLocationQuery(address);
    setShowCurrentLocationSuggestions(false);

    if (stops.length > 0 && !stops[0].address) {
      setActiveLocationInput(stops[0].id);
    }
  };

  const handleStopAddressChange = (stopId: string, value: string) => {
    setStopAddressQuery(prev => ({ ...prev, [stopId]: value }));
    setShowStopSuggestions(prev => ({ ...prev, [stopId]: true }));
  };

  const handleStopAddressSelect = (stopId: string, address: string, description: string) => {
    updateStop(stopId, { address, description });
    setStopAddressQuery(prev => ({ ...prev, [stopId]: '' }));
    setShowStopSuggestions(prev => ({ ...prev, [stopId]: false }));

    const currentIndex = stops.findIndex(s => s.id === stopId);
    if (currentIndex < stops.length - 1) {
      const nextStop = stops[currentIndex + 1];
      if (!nextStop.address) {
        setActiveLocationInput(nextStop.id);
      }
    }
  };

  const handleAddStop = () => {
    if (!canAddStop()) return;

    const newStop = {
      id: `stop-${Date.now()}`,
      address: '',
      foodIds: []
    };
    addStop(newStop);
    setActiveLocationInput(newStop.id);
  };

  const handleRemoveStop = (stopId: string) => {
    removeStop(stopId);
    setActiveLocationInput('current-location');
  };

  const handleGoToDelivery = () => {
    removeStopsWithoutFoodOrAddress();
    console.log('Navigate to delivery selection page');
  };

  const currentLocationFoods = getCurrentLocationFoods();
  const currentLocationSuggestions = getDeliveryAddressSuggestions(currentLocationQuery);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen bg-gray-50"
    >
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900">Foodies Route</h1>
        </div>

        <div className="relative mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div className={`flex-1 relative flex items-center rounded-xl px-4 py-3 transition-all ${
              activeLocationInput === 'current-location'
                ? 'bg-green-100 border-2 border-green-500'
                : 'bg-gray-100 border-2 border-transparent'
            }`}>
              <input
                ref={currentLocationInputRef}
                type="text"
                value={currentLocationQuery}
                onChange={(e) => handleCurrentLocationChange(e.target.value)}
                onFocus={() => {
                  setActiveLocationInput('current-location');
                  setShowCurrentLocationSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowCurrentLocationSuggestions(false), 200)}
                placeholder={locationLoading ? 'Getting your location...' : 'Search delivery location'}
                className="flex-1 bg-transparent text-gray-900 text-sm outline-none"
              />
              <motion.button
                onClick={() => setShowCurrentLocationModal(true)}
                disabled={currentLocationFoods.length === 0}
                className="ml-2 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors relative"
                whileTap={{ scale: 0.95 }}
              >
                <UtensilsCrossed size={14} className="text-gray-700" />
                <span className="text-xs font-medium text-gray-700">View your food</span>
                {currentLocationFoods.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {currentLocationFoods.length}
                  </span>
                )}
              </motion.button>
            </div>
            <motion.button
              onClick={handleAddStop}
              disabled={!canAddStop()}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                canAddStop()
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileTap={{ scale: canAddStop() ? 0.95 : 1 }}
            >
              <Plus size={20} />
            </motion.button>
          </div>

          <AnimatePresence>
            {showCurrentLocationSuggestions && currentLocationQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-20 border border-gray-200"
              >
                {currentLocationSuggestions.slice(0, 4).map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => handleCurrentLocationSelect(addr.address, addr.description)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <Clock size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">{addr.name}</p>
                      <p className="text-xs text-gray-500">{addr.description}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {stops.map((stop, index) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 relative"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className={`flex-1 relative flex items-center rounded-xl px-4 py-3 transition-all ${
                  activeLocationInput === stop.id
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-white border-2 border-gray-200'
                }`}>
                  <input
                    ref={(el) => {
                      if (el) stopInputRefs.current[stop.id] = el;
                    }}
                    type="text"
                    value={stop.address || stopAddressQuery[stop.id] || ''}
                    onChange={(e) => handleStopAddressChange(stop.id, e.target.value)}
                    onFocus={() => {
                      setActiveLocationInput(stop.id);
                      setShowStopSuggestions(prev => ({ ...prev, [stop.id]: true }));
                    }}
                    onBlur={() => setTimeout(() => setShowStopSuggestions(prev => ({ ...prev, [stop.id]: false })), 200)}
                    placeholder="Add stop"
                    className="flex-1 bg-transparent text-gray-900 text-sm outline-none"
                  />
                  <motion.button
                    onClick={() => setShowStopModal(stop.id)}
                    disabled={cartItems.length < 2}
                    className="ml-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors relative"
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xs font-medium text-gray-700">
                      {stop.foodIds.length > 0 ? (
                        <>
                          Food added
                          <sup className="text-[10px]">{stop.foodIds.length}</sup>
                        </>
                      ) : (
                        'Add Food'
                      )}
                    </span>
                  </motion.button>
                </div>
                <button
                  onClick={() => handleRemoveStop(stop.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>

              <AnimatePresence>
                {showStopSuggestions[stop.id] && stopAddressQuery[stop.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-12 right-0 mt-2 bg-white rounded-xl shadow-lg z-20 border border-gray-200"
                  >
                    {getDeliveryAddressSuggestions(stopAddressQuery[stop.id]).slice(0, 4).map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => handleStopAddressSelect(stop.id, addr.address, addr.description)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <Clock size={16} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 text-sm">{addr.name}</p>
                          <p className="text-xs text-gray-500">{addr.description}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {(activeLocationInput !== 'current-location' && !stops.find(s => s.id === activeLocationInput)?.address) && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 px-2 py-1">Recent addresses</p>
            {mockDeliveryAddresses.slice(0, 6).map((addr) => (
              <motion.button
                key={addr.id}
                onClick={() => {
                  if (activeLocationInput !== 'current-location') {
                    handleStopAddressSelect(activeLocationInput, addr.address, addr.description);
                  }
                }}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <Clock size={20} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm">{addr.name}</p>
                  <p className="text-xs text-gray-500">{addr.description}</p>
                </div>
                {addr.distance && (
                  <span className="text-xs text-gray-400">{addr.distance}</span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleGoToDelivery}
          disabled={currentLocationFoods.length === 0}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            currentLocationFoods.length > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Go to delivery
        </button>
      </div>

      <FoodSelectionModal
        isOpen={showCurrentLocationModal}
        onClose={() => setShowCurrentLocationModal(false)}
        title="Your Food"
        stopId="current-location"
        mode="current-location"
      />

      {showStopModal && (
        <FoodSelectionModal
          isOpen={true}
          onClose={() => setShowStopModal(null)}
          title="Select Food for Stop"
          stopId={showStopModal}
          mode="stop"
        />
      )}
    </motion.div>
  );
}
