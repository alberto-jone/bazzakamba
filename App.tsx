
import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { SelectionScreen } from './components/SelectionScreen';
import { TrackingScreen } from './components/TrackingScreen';
import { RatingScreen } from './components/RatingScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { AdminScreen } from './components/AdminScreen';
import { DriverModeScreen } from './components/DriverModeScreen';
import { PrototypeFeedbackScreen } from './components/PrototypeFeedbackScreen';
import { ViewState, RideOption } from './types';
import { RIDE_OPTIONS } from './constants';
import { db } from './services/db';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('register');
  const [selectedRide, setSelectedRide] = useState<RideOption>(RIDE_OPTIONS[1]); // Default to Economy
  const [rideRating, setRideRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check for persistent login on mount & redirect based on role
  useEffect(() => {
    const user = db.getLoggedInUser();
    if (user) {
      if (user.role === 'admin' || user.role === 'driver') {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
      }
    }
    setIsLoading(false);
  }, []);

  const handleRideSelect = (ride: RideOption) => {
    setSelectedRide(ride);
  };

  const navigate = (view: ViewState) => {
    setCurrentView(view);
  };

  const handleLoginSuccess = () => {
    const user = db.getLoggedInUser();
    if (user?.role === 'admin' || user?.role === 'driver') {
      navigate('admin');
    } else {
      navigate('home');
    }
  };

  // Track completion
  const handleSimulationComplete = () => {
    db.incrementSimulationCount();
    navigate('rating');
  };

  // Handle Logout
  const handleLogout = () => {
    db.logout();
    navigate('register');
  };

  if (isLoading) return null; // Or a splash screen

  // Mobile Frame Wrapper
  return (
    <div className="h-screen w-full flex items-center justify-center p-0 sm:p-4 bg-gray-800">
      {/* Responsive Container - Maximized Height */}
      <div className="w-full max-w-md bg-white h-full sm:h-[95vh] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-[6px] border-gray-900 relative flex flex-col transition-all">
        
        {/* Status Bar Simulation */}
        <div className="absolute top-0 left-0 right-0 h-12 z-50 flex justify-end items-center px-6 pt-3 text-black font-medium text-xs pointer-events-none select-none mix-blend-difference text-white">
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-white rounded-full opacity-20"></div>
            <div className="w-4 h-4 bg-white rounded-full opacity-20"></div>
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 h-full overflow-hidden bg-gray-50 relative flex flex-col">
          
          {currentView === 'register' && (
            <RegistrationScreen 
              onRegister={handleLoginSuccess}
              onAdminRequest={() => navigate('admin')}
            />
          )}

          {currentView === 'admin' && (
             <AdminScreen 
               onBack={handleLogout} 
               onGoToMap={() => navigate('driver_mode')}
             />
          )}

          {currentView === 'driver_mode' && (
            <DriverModeScreen 
              onExit={() => navigate('admin')} 
            />
          )}

          {currentView === 'prototype_feedback' && (
            <PrototypeFeedbackScreen onFinish={() => {
              setRideRating(0);
              navigate('home');
            }} />
          )}

          {currentView === 'home' && (
            <HomeScreen 
              selectedRide={selectedRide}
              onSelectRide={handleRideSelect}
              onNext={() => navigate('selection')} 
              onNavigateTo={(view) => navigate(view)}
              onLogout={handleLogout}
            />
          )}
          
          {currentView === 'selection' && (
            <SelectionScreen 
              selectedRide={selectedRide} 
              onSelect={handleRideSelect} 
              onBack={() => navigate('home')}
              onConfirm={() => navigate('tracking')}
            />
          )}

          {currentView === 'tracking' && (
            <TrackingScreen 
              selectedRide={selectedRide}
              onCancel={() => navigate('home')}
              onComplete={handleSimulationComplete}
            />
          )}

          {currentView === 'rating' && (
            <RatingScreen 
              rating={rideRating}
              setRating={setRideRating}
              onSubmit={() => navigate('summary')}
              onSkip={() => navigate('summary')}
            />
          )}

          {currentView === 'summary' && (
            <SummaryScreen 
              selectedRide={selectedRide}
              rating={rideRating}
              onHome={() => {
                setRideRating(0);
                navigate('home');
              }}
              onFeedbackApp={() => navigate('prototype_feedback')}
            />
          )}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-black rounded-full opacity-20 z-50 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default App;
