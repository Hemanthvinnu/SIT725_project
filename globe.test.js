/**
 * @jest-environment jsdom
 */

// Mock globe.js functionality
const GlobeFunctions = {
    initGlobe: function() {
      return {
        addData: jest.fn(),
        pointOfView: jest.fn(),
        controls: { autoRotate: true }
      };
    },
    
    formatNumber: function(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    calculateDistance: function(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
  };
  
  describe('Globe Visualization', () => {
    test('should initialize globe with default settings', () => {
      const globe = GlobeFunctions.initGlobe();
      
      expect(globe).toHaveProperty('addData');
      expect(globe).toHaveProperty('pointOfView');
      expect(globe.controls.autoRotate).toBe(true);
    });
  
    test('should format numbers with commas', () => {
      expect(GlobeFunctions.formatNumber(1000)).toBe('1,000');
      expect(GlobeFunctions.formatNumber(1000000)).toBe('1,000,000');
      expect(GlobeFunctions.formatNumber(123)).toBe('123');
    });
  
    test('should calculate distance between coordinates', () => {
      // Melbourne to Sydney approximate distance
      const distance = GlobeFunctions.calculateDistance(
        -37.8136, 144.9631, // Melbourne
        -33.8688, 151.2093  // Sydney
      );
      
      expect(distance).toBeGreaterThan(600);
      expect(distance).toBeLessThan(800);
      
      // Same location should be 0
      const zeroDistance = GlobeFunctions.calculateDistance(
        -37.8136, 144.9631,
        -37.8136, 144.9631
      );
      
      expect(zeroDistance).toBe(0);
    });
  });