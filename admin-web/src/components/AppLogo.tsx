import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getAssetUrl } from '../utils/asset';

interface AppLogoProps {
  className?: string;
  alt?: string;
  onClick?: () => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "h-12 w-auto object-contain flex-shrink-0",
  alt = "App Logo",
  onClick,
}) => {
  const { logoUrl } = useLanguage();

  return (
    <img
      src={getAssetUrl(logoUrl)}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
};
