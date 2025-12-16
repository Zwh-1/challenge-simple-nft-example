import { useState, useEffect } from "react";
import clsx from "clsx";

interface SkeletonLoaderProps {
  type?: "text" | "image" | "card" | "list" | "button" | "input" | "custom";
  count?: number;
  className?: string;
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  rounded?: boolean;
  circle?: boolean;
}

/**
 * Generic skeleton loader component with multiple types and animations
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "text",
  count = 1,
  className,
  width,
  height,
  animation = "pulse",
  rounded = true,
  circle = false,
}) => {
  const baseClasses = "bg-base-300";
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-bounce",
    none: "",
  };

  const getDefaultDimensions = (type: string) => {
    switch (type) {
      case "text":
        return { width: "100%", height: "1rem" };
      case "image":
        return { width: "100%", height: "200px" };
      case "card":
        return { width: "100%", height: "300px" };
      case "button":
        return { width: "120px", height: "40px" };
      case "input":
        return { width: "100%", height: "48px" };
      default:
        return { width: "100%", height: "1rem" };
    }
  };

  const dimensions = {
    width: width || getDefaultDimensions(type).width,
    height: height || getDefaultDimensions(type).height,
  };

  const skeletonClass = clsx(
    baseClasses,
    animationClasses[animation],
    rounded && !circle && "rounded-lg",
    circle && "rounded-full",
    className
  );

  const skeletonStyle = {
    width: dimensions.width,
    height: dimensions.height,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={skeletonClass}
          style={skeletonStyle}
        />
      ))}
    </>
  );
};

/**
 * NFT Card skeleton loader
 */
export const NFTCardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card bg-base-100 shadow-xl">
          <figure className="relative">
            <SkeletonLoader type="image" height="250px" />
          </figure>
          <div className="card-body">
            <SkeletonLoader type="text" width="80%" height="1.5rem" />
            <SkeletonLoader type="text" count={2} />
            <div className="card-actions justify-between items-center mt-4">
              <SkeletonLoader type="text" width="60px" height="1.5rem" />
              <SkeletonLoader type="button" width="100px" height="36px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Marketplace skeleton loader
 */
export const MarketplaceSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SkeletonLoader type="text" width="200px" height="2rem" />
        <div className="flex gap-4 mt-4">
          <SkeletonLoader type="input" width="200px" />
          <SkeletonLoader type="input" width="150px" />
          <SkeletonLoader type="button" />
        </div>
      </div>
      <NFTCardSkeleton count={8} />
    </div>
  );
};

/**
 * Profile skeleton loader
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <SkeletonLoader type="custom" width="80px" height="80px" circle />
        <div className="flex-1">
          <SkeletonLoader type="text" width="200px" height="2rem" />
          <SkeletonLoader type="text" width="150px" height="1rem" />
        </div>
      </div>
      <div className="mb-6">
        <SkeletonLoader type="text" width="150px" height="1.5rem" />
      </div>
      <NFTCardSkeleton count={6} />
    </div>
  );
};

/**
 * Form skeleton loader
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <SkeletonLoader type="text" width="100px" height="1rem" />
          <SkeletonLoader type="input" />
        </div>
      ))}
      <div className="flex gap-4 mt-6">
        <SkeletonLoader type="button" />
        <SkeletonLoader type="button" />
      </div>
    </div>
  );
};

/**
 * Table skeleton loader
 */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, index) => (
              <th key={index}>
                <SkeletonLoader type="text" width="80px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex}>
                  <SkeletonLoader type="text" width={`${Math.random() * 60 + 40}px`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Loading wrapper component that shows skeleton while loading
 */
interface LoadingWrapperProps {
  isLoading: boolean;
  skeletonType?: "card" | "list" | "table" | "form" | "profile" | "marketplace" | "nft-card";
  skeletonCount?: number;
  children: React.ReactNode;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  skeletonType = "card",
  skeletonCount,
  children,
  className,
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  const renderSkeleton = () => {
    switch (skeletonType) {
      case "nft-card":
        return <NFTCardSkeleton count={skeletonCount} />;
      case "marketplace":
        return <MarketplaceSkeleton />;
      case "profile":
        return <ProfileSkeleton />;
      case "form":
        return <FormSkeleton fields={skeletonCount} />;
      case "table":
        return <TableSkeleton rows={skeletonCount} />;
      case "card":
        return <SkeletonLoader type="card" count={skeletonCount} />;
      case "list":
        return <SkeletonLoader type="list" count={skeletonCount} />;
      default:
        return <SkeletonLoader type="text" count={skeletonCount} />;
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;