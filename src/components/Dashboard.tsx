import React from 'react';
import MapView from './MapView';

interface DashboardProps {
  theme: 'dark' | 'light';
}

export default function Dashboard({ theme }: DashboardProps) {
  return <MapView theme={theme} />;
}