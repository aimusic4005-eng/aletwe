import { useMemo } from 'react';

export type DeliveryMode = 'car' | 'motorbike' | 'bicycle';

interface EstimationConfig {
  baseFee: number;
  perKmRate: number;
  stopPenalty: number;
  speeds: {
    car: number;
    motorbike: number;
    bicycle: number;
  };
}

const ESTIMATION_CONFIG: EstimationConfig = {
  baseFee: 50,
  perKmRate: 15,
  stopPenalty: 30,
  speeds: {
    car: 1.2,
    motorbike: 1.5,
    bicycle: 0.4
  }
};

export interface DeliveryEstimate {
  foodSubtotal: number;
  deliveryFee: number;
  totalPrice: number;
  estimatedTime: number;
  breakdown: {
    baseFee: number;
    distanceFee: number;
    stopFee: number;
  };
}

interface UseDeliveryEstimationParams {
  foodSubtotal: number;
  routeDistance: number;
  numberOfStops: number;
  deliveryMode: DeliveryMode;
}

export function useDeliveryEstimation({
  foodSubtotal,
  routeDistance,
  numberOfStops,
  deliveryMode
}: UseDeliveryEstimationParams): DeliveryEstimate {
  return useMemo(() => {
    const baseFee = ESTIMATION_CONFIG.baseFee;
    const distanceFee = Math.ceil(routeDistance * ESTIMATION_CONFIG.perKmRate);
    const stopFee = numberOfStops * ESTIMATION_CONFIG.stopPenalty;
    const deliveryFee = baseFee + distanceFee + stopFee;

    const totalPrice = foodSubtotal + deliveryFee;

    const speed = ESTIMATION_CONFIG.speeds[deliveryMode];
    const estimatedTime = Math.ceil((routeDistance / speed) * 60);

    return {
      foodSubtotal,
      deliveryFee,
      totalPrice,
      estimatedTime,
      breakdown: {
        baseFee,
        distanceFee,
        stopFee
      }
    };
  }, [foodSubtotal, routeDistance, numberOfStops, deliveryMode]);
}

export function calculateFoodSubtotal(
  cartItems: Array<{ price: number }>
): number {
  return cartItems.reduce((sum, item) => sum + item.price, 0);
}

export function calculateRouteDistance(
  pickupLocation: string,
  stops: Array<{ address: string }>,
  deliveryLocation: string
): number {
  const mockDistances: { [key: string]: number } = {
    '9-Eastwood-St-KFC': 2.5,
    'Mandahill-St': 3.2,
    'East-Park': 1.8,
    'default': 2.0
  };

  let totalDistance = 0;
  const locations = [pickupLocation, ...stops.map(s => s.address), deliveryLocation];

  for (let i = 0; i < locations.length - 1; i++) {
    const key = locations[i].replace(/\s+/g, '-').toLowerCase();
    totalDistance += mockDistances[key] || mockDistances['default'];
  }

  return totalDistance;
}

export const DELIVERY_MODES = [
  {
    id: 'motorbike',
    name: 'Motorbike',
    icon: '🏍️',
    description: 'Fast delivery',
    eta: '8-12 min',
    basePrice: 40
  },
  {
    id: 'car',
    name: 'Car',
    icon: '🚗',
    description: 'Standard delivery',
    eta: '12-18 min',
    basePrice: 60
  },
  {
    id: 'bicycle',
    name: 'Bicycle',
    icon: '🚴',
    description: 'Eco-friendly',
    eta: '20-30 min',
    basePrice: 25
  }
];

export function getDeliveryModesByTab(
  tab: 'recommended' | 'faster' | 'cheaper'
): typeof DELIVERY_MODES {
  switch (tab) {
    case 'faster':
      return [
        DELIVERY_MODES[0],
        DELIVERY_MODES[1],
        DELIVERY_MODES[2]
      ];
    case 'cheaper':
      return [
        DELIVERY_MODES[2],
        DELIVERY_MODES[0],
        DELIVERY_MODES[1]
      ];
    case 'recommended':
    default:
      return [
        DELIVERY_MODES[0],
        DELIVERY_MODES[1],
        DELIVERY_MODES[2]
      ];
  }
}
