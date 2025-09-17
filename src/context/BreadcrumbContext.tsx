import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type ActiveButtonType = 'Request' | 'Review' | 'Approval' | null;

export const ACTIVE_BUTTONS: ActiveButtonType[] = [
  "Request",
  "Review",
  "Approval",
];

interface BreadcrumbContextType {
  activeButton: ActiveButtonType;
  setActiveButton: (button: ActiveButtonType) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

interface BreadcrumbProviderProps {
  children: ReactNode;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({ children }) => {
  const [activeButton, setActiveButton] = useState<ActiveButtonType>('Request'); // NOTE: Default to 'Request' 

  const value: BreadcrumbContextType = {
    activeButton,
    setActiveButton
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = (): BreadcrumbContextType => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};