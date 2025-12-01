import React from 'react';

interface TourStepProps {
  id: string;
  children: React.ReactNode;
}

export const TourStep: React.FC<TourStepProps> = ({ id, children }) => {
  return <div data-tour-id={id}>{children}</div>;
};
